import Config from './config';
import {d, get} from "./utils";
import {
    ACTION_ERROR,
    ACTION_SUCCESS,
    LOADING_END,
    LOADING_START,
    ACTION_PROGRESS
} from "../constants";

class Actions {
    constructor(parent, client) {
        this.list = {};
        this.parent = parent;
        this.httpClient = client;
        this.parent.http = this.makeHttpClient();
        this.useDevGateway();
    }

    _isLogout(config) {
        let isLogout = config.url.indexOf('logout') > -1;

        if (!isLogout) {
            try {
                const [action, payload] = JSON.parse(config.data);
                isLogout = action === 'logout';
            } catch {

            }
        }

        return isLogout;
    }

    async useDevGateway() {
        const config = this.parent.config;

        if (!config.get('dev')) {
            return;
        }

        /**
         * Reload action definitions
         * on server restart and log
         * gateway responses
         */

        let failed = false;

        try {
            const url = config.get('devGateway') ? config.get('devGateway') : `${config.get('handler')}/_dev_gateway`;
            const {data} = await this.parent.http.get(url);
            d('info', '(s)', data);
        } catch(e) {
            failed = true;
            setTimeout(async () => {
                await this.setup();
            }, 1000);
        }

        setTimeout(async () => {
            await this.useDevGateway();
        }, failed ? 3000 : 0);
    }

    makeHttpClient() {
        const tokenHandler = Config.get('tokenHandler');
        const token = tokenHandler.get('token');
        const options = {};

        if (token) {
            options.headers = {
                Authorization: token
            };
        }

        const client = this.httpClient.create(options);

        const onAuthFailed = async () => {
            await this.parent.auth.logout();
            let fn = Config.get('authFailed');
            typeof fn === 'function' && fn();
        };

        client.interceptors.response.use(response => {
            return response;
        }, async error => {
            if (
                error.response &&
                error.response.status === 401
                && !this._isLogout(error.config)
            ) {
                const refreshToken = tokenHandler.get('refresh');

                if (refreshToken) {
                    d('info', '+ token refresh');
                    const {data, errors} = await this.parent.refreshToken({token: refreshToken});

                    if (errors) {
                        await onAuthFailed();
                        return error;
                    }

                    /**
                     * Update the tokens
                     */

                    d('info', '(ok) refreshed token');
                    tokenHandler.set('token', data.token);
                    tokenHandler.set('refresh', data.refresh);
                    this.parent.http.defaults.headers.Authorization = data.token;

                    /**
                     * Retry the request
                     */

                    error.config.headers.Authorization = data.token;
                    return client.request(error.config);
                }

                await onAuthFailed();
            }

            return Promise.reject(error);
        });

        return client;
    }

    getAction(action) {
        return this.list[action];
    }

    getCache() {
        return Actions.cache;
    }

    async setup(actions = {}) {
        const http = this.parent.http;

        if (!Config.get('actions')) {
            return;
        }

        let data = {};

        if (!Object.keys(actions).length) {
            d('info', '+ actions');

            try {
                const {data: actions} = await http.get(Config.get('actions'));
                data = actions;
            } catch(errors) {
                d('error', '(error) failed loading actions list', errors);
                this.parent.events.emit(ACTION_ERROR, ['init', errors]);
            }
        } else {
            data = actions;
        }

        this.list = data;

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            if (this.hasOwnProperty(key)) {
                d('warn', `(err) (${key}) already registered`);
                continue;
            }

            this.parent[key] = async (payload, options = {}) => {
                const tokenHandler = Config.get('tokenHandler');
                const {data, errors} = await this._call(key, payload, options);

                if (errors) {
                    return {
                        data,
                        errors
                    };
                }

                if ((key === 'login' || key === 'setPassword') && data.token) {
                    tokenHandler.set('token', data.token);
                    this.parent.http.defaults.headers.Authorization = data.token;

                    if (Config.get('refresh') && data.refresh) {
                        tokenHandler.set('refresh', data.refresh);
                    }

                    if (Config.get('socket')) {
                        this.parent.socket.emit('login', data.token);
                    }
                }

                if (key === 'logout') {
                    tokenHandler.remove('token');
                    tokenHandler.remove('refresh');
                    this.parent.http.defaults.headers.Authorization = null;

                    if (Config.get('socket')) {
                        this.parent.socket.emit('logout');
                    }
                }

                return {
                    data,
                    errors
                };
            };
        }
    }

    _configAction(withProgress = false, name = '') {
        const config = {};

        if (withProgress) {
            config.onUploadProgress = e => {
                let percent = Math.floor((e.loaded * 100) / e.total);
                this.parent.events.emit(ACTION_PROGRESS, [name, percent]);
            };

            config.onDownloadProgress = e => {
                let percent = Math.floor((e.loaded * 100) / e.total);
                this.parent.events.emit(ACTION_PROGRESS, [name, percent]);
            };
        }

        return config;
    };

    async _validateAction(action, payload)  {
        let result = false;

        if (this.list[action] && Object.keys(this.list[action]).length) {
            const errors = await this.parent.validator.validate(payload, this.list[action]);

            if (Object.keys(errors).length) {
                result = errors;
                d('info', `(err) (${action})(local validation)`, errors);
            }
        }

        return result;
    };

    /**
     * Calls a batched request
     */

    async batch(
        actions = {},
        options = {
            validate: true
        })
    {
        let result = {
            errors: false,
            data: false
        };

        const names = Object.keys(actions).join(', ');
        const start = +new Date();
        d('info', `+ running (${names})`);

        const form = [];

        for (const action in actions) {
            const payload = actions[action];

            if (options.validate) {
                const errors = await this._validateAction(action, payload);

                if (errors) {
                    if (!result.errors) {
                        result.errors = {};
                    }

                    result.errors[action] = errors;
                    continue;
                }
            }

            form.push([action, payload]);
        }

        if (!form.length) {
            return this.finishTransaction(options, null, result, actions, start);
        }

        try {
            const {data: actionResults} = await this.parent.http.post(
                Config.get('handler'),
                form,
                this._configAction(options.progress, names)
            );

            if (!Array.isArray(actionResults)) {
                result.errors = {
                    other: {
                        message: [
                            'Unexpected API response'
                        ]
                    }
                }
            } else {
                for (const actionResult of actionResults) {
                    let action = Object.keys(actionResult)[0];
                    let data = actionResult[action];

                    if (actionResult[action].errors) {
                        if (!result.errors) {
                            result.errors = {};
                        }

                        result.errors[action] = actionResult[action].errors;
                        continue;
                    }

                    if (!result.data) {
                        result.data = {};
                    }

                    result.data[action] = data;
                }
            }
        } catch(e) {
            const errors = get(e, 'response.data.errors', false);

            result.errors = {
                other: errors ? errors : {
                    message: [
                        e.response
                    ]
                }
            }
        }

        return this.finishTransaction(options, null, result, actions, start);
    }

    finishTransaction(options, action, result, payload, start) {
        if (options.loading) {
            this.parent.events.emit(LOADING_END, [action, payload]);
        }

        if (result.errors) {
            if (action === null) {
                for (const key in Object.keys(result.errors)) {
                    this.parent.events.emit(ACTION_ERROR, [key, result.errors[key], payload[key]]);
                }
            } else {
                this.parent.events.emit(ACTION_ERROR, [action, result.errors, payload]);
            }
        } else {
            if (action === null) {
                for (const key in Object.keys(result.data)) {
                    this.parent.events.emit(ACTION_SUCCESS, [key, result.data[key], payload[key]]);
                }
            } else {
                this.parent.events.emit(ACTION_SUCCESS, [action, result.data, payload]);
            }
        }

        const end = +new Date();
        d(!!result.errors ? 'error' : 'info', `(${!!result.errors ? 'fail' : 'ok'}) (${action}) in (${end - start} ms)`, result);
        return result;
    }

    /**
     * Call an action
     * @returns
     * @private
     */

    async _call(
        action,
        payload = {},
        options = {
            validate: true,
            cache: false,
            shouldInvalidate: false
        }
    ) {
        let result = {
            errors: false,
            data: false
        };

        if (options.loading) {
            this.parent.events.emit(LOADING_START, [action, payload]);
        }

        const start = +new Date();
        d('info', `+ running (${action}), payload:`, payload);

        /**
         * If in cache, return cached value
         */

        if (typeof options.shouldInvalidate === 'function'
            && options.shouldInvalidate(Actions.cache[action], Actions.cache[action])) {
            delete Actions.cache[action];
        }

        if (Actions.cache[action] && Actions.cache[action].data) {
            d('info', `+ cache (${action}) is cached`);
            result = Actions.cache[action];
            return this.finishTransaction(options, action, result, payload, start);
        }

        /**
         * Do client side validation
         */

        if (options.validate) {
            const errors = await this._validateAction(action, payload);

            if (errors) {
                result.errors = errors;
                return this.finishTransaction(options, action, result, payload, start);
            }
        }

        /**
         * Handle the backend request
         */

        try {
            let method = 'post';
            let path = Config.get('handler');

            if (Array.isArray(action)) {
                method = action[0];
                path = action[1];
            }

            const {data} = await this.parent.http[method](
                path,
                (typeof window !== 'undefined' && payload instanceof FormData) ? payload : [action, payload],
                this._configAction(options.progress, action)
            );

            if (data && data.errors) {
                result.errors = data.errors;
            } else {
                result.data = data;

                if (options.cache) {
                    d('info', `+ cache Adding data to cache for (${action})`);
                    Actions.cache[action] = result;
                    Actions.cache[action].createdAt = new Date();
                }
            }
        } catch(e) {
            const debug = get(e, 'response.data.debug', false);
            const errors = get(e, 'response.data.errors', false);

            result.errors = errors ? errors : {
                message: [
                    e.response ? e.response : e
                ]
            };

            if (debug) {
                result.debug = debug;
            }
        }

        if (this.parent.config.get('debug') && typeof window !== 'undefined') {
            let commands = JSON.parse(localStorage.getItem('commands') || '[]');
            let cmd = `client.call('${action}', ${JSON.stringify(payload)}, ${JSON.stringify(options)});`;

            if (commands[commands.length - 1] !== cmd) {
                commands.push(cmd);

                if (commands.length > 50) {
                    commands.splice(0, 1);
                }

                localStorage.setItem('lastCommands', JSON.stringify(commands));
            }
        }

        action = Array.isArray(action) ? action[1] : action;
        return this.finishTransaction(options, action, result, payload, start);
    }
}

Actions.cache = {};

export default Actions;
