import Config from './config';
import {d, get} from "./utils";
import {
    ACTION_ERROR,
    ACTION_SUCCESS,
    LOADING_END,
    LOADING_START,
    ACTION_PROGRESS
} from "../constants";

export default class Actions {
    constructor(parent, client) {
        this.parent = parent;
        this.httpClient = client;
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

    makeHttpClient() {
        const options = {
            baseURL: Config.get('path')
        };

        const tokenHandler = Config.get('tokenHandler');
        const token = tokenHandler.get('token');

        if (token) {
            options.headers = {
                Authorization: token
            };
        }

        const client = this.httpClient.create(options);

        const onAuthFailed = () => {
            this.parent.auth.logout();
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
                    d('info', 'Attempting token refresh');
                    const {data, errors} = await this.parent.refreshToken({token: refreshToken});

                    if (errors) {
                        onAuthFailed();
                        return error;
                    }

                    /**
                     * Update the tokens
                     */

                    d('info', 'Successfully refreshed token, retrying request.');
                    tokenHandler.set('token', data.token);
                    tokenHandler.set('refresh', data.refresh);
                    this.parent.http.defaults.headers.Authorization = data.token;

                    /**
                     * Retry the request
                     */

                    error.config.headers.Authorization = data.token;
                    return client.request(error.config);
                }

                onAuthFailed();
            }

            return Promise.reject(error);
        });

        return client;
    }

    getAction(action) {
        return Actions.actions[action];
    }

    async setup(actions = {}) {
        const http = this.parent.http = this.makeHttpClient();

        if (!Config.get('actions')) {
            return;
        }

        let data = {};

        if (!Object.keys(actions).length) {
            try {
                const {data: actions} = await http.get(Config.get('actions'));
                data = actions;
            } catch(errors) {
                d('error', 'Could not load actions list.');
                this.parent.events.emit(ACTION_ERROR, ['init', errors]);
            }
        } else {
            data = actions;
        }

        Actions.actions = data;

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            if (this.hasOwnProperty(key)) {
                d('warn', `Could not register ${key} as it is already being used.`);
                continue;
            }

            this.parent[key] = async payload => {
                const tokenHandler = Config.get('tokenHandler');
                const {data, errors} = await this._call(key, payload);

                if (key === 'login' && data.token) {
                    tokenHandler.set('token', data.token);
                    this.parent.http.defaults.headers.Authorization = data.token;

                    if (Config.get('refresh')) {
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

                return {data, errors};
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

        if (Actions.actions[action] && Object.keys(Actions.actions[action]).length) {
            const errors = await this.parent.validator.validate(payload, Actions.actions[action]);

            if (Object.keys(errors).length) {
                result = errors;
                d('info', `Local validation failed for [${action}], errors:`, errors);
            }
        }

        return result;
    };

    /**
     * Calls a batched request
     */

    async batch(actions = {}, extra = {}) {
        let result = {
            errors: false,
            data: false
        };

        const names = Object.keys(actions).join(', ');
        const start = +new Date();
        d('info', `Doing batched action [${names}].`);

        const form = [];

        const {
            __progress__: withProgress,
            __loading__: withLoading
        } = extra;

        const finishTransaction = () => {
            if (withLoading) {
                this.parent.events.emit(LOADING_END, []);
            }

            if (result.errors) {
                for (const key in Object.keys(result.errors)) {
                    this.parent.events.emit(ACTION_ERROR, [key, result.errors[key], actions[key]]);
                }
            } else {
                for (const key in Object.keys(result.data)) {
                    this.parent.events.emit(ACTION_ERROR, [key, result.data[key], actions[key]]);
                }
            }

            const end = +new Date();
            d('info', `Finished doing batch action [${names}] in [${end - start} ms], result:`, result);
            return result;
        };

        for (const action in actions) {
            const payload = actions[action];

            const errors = await this._validateAction(action, payload);

            if (errors) {
                if (!result.errors) {
                    result.errors = {};
                }

                result.errors[action] = errors;
                continue;
            }

            form.push([action, payload]);
        }

        if (!form.length) {
            return finishTransaction();
        }

        try {
            const {data: actionResults} = await this.parent.http.post(
                Config.get('handler'),
                form,
                this._configAction(withProgress, names)
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

        return finishTransaction();
    }

    /**
     * Call an action
     * @returns
     * @private
     */

    async _call(action, data = {}) {
        let result = {
            errors: false,
            data: false
        };

        const {
            __progress__: withProgress,
            __loading__: withLoading,
            ...payload
        } = data;

        if (withLoading) {
            this.parent.events.emit(LOADING_START, [action, payload]);
        }

        const start = +new Date();
        d('info', `Doing action [${action}], sent payload:`, payload);

        const finishTransaction = () => {
            if (withLoading) {
                this.parent.events.emit(LOADING_END, [action, payload]);
            }

            if (result.errors) {
                this.parent.events.emit(ACTION_ERROR, [action, result.errors, payload]);
            } else {
                this.parent.events.emit(ACTION_SUCCESS, [action, result.data, payload]);
            }

            const end = +new Date();
            d('info', `Finished doing action [${action}] in [${end - start} ms], result:`, result);
            return result;
        };

        /**
         * Do client side validation
         */

        const errors = await this._validateAction(action, payload);

        if (errors) {
            result.errors = errors;
            d('info', `Local validation failed for [${action}], errors:`, errors);
            return finishTransaction();
        }

        /**
         * Handle the backend request
         */

        try {
            const {data} = await this.parent.http.post(
                Config.get('handler'),
                [action, payload],
                this._configAction(withProgress, action)
            );

            if (data && data.errors) {
                result.errors = data.errors;
            } else {
                result.data = data;
            }
        } catch(e) {
            const errors = get(e, 'response.data.errors', false);

            result.errors = errors ? errors : {
                message: [
                    e.response
                ]
            };
        }

        return finishTransaction();
    }
}

Actions.actions = {};