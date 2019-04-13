import Config from './config';
import axios from 'axios';
import {d, get} from "./utils";

export default class Actions {
    constructor(parent) {
        this.parent = parent;
        this.setup();
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

        const client = axios.create(options);

        const onAuthFailed = () => {
            this.parent._auth.logout();
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
                    d('Attempting token refresh');
                    const {data, errors} = await this.parent.refreshToken({token: refreshToken});

                    if (errors) {
                        onAuthFailed();
                        return error;
                    }

                    /**
                     * Update the tokens
                     */

                    d('Successfully refreshed token, retrying request.');
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

    async setup() {
        const http = this.parent.http = this.makeHttpClient();

        if (!Config.get('actions')) {
            return;
        }

        let data = {};

        try {
            const {data: actions} = await http.get(Config.get('actions'));
            data = actions;
        } catch {
            d('Could not load actions list');
        }

        Actions.actions = data;

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            if (this.hasOwnProperty(key)) {
                d(`Could not register ${key} as it is already being used.`);
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

        this.parent._event.emit('loaded');
    }

    /**
     * Call an action
     * @returns {Promise<function(*=): void>}
     * @private
     */

    async _call(action, payload = {}) {
        let result = {
            errors: false,
            data: false
        };

        const start = +new Date();
        d(`Doing action ${action}, sent payload:`, payload);

        /**
         * Do client side validation
         */

        if (Actions.actions[action] && Object.keys(Actions.actions[action]).length) {
            const errors = await this.parent._validator.validate(payload, Actions.actions[action]);

            if (Object.keys(errors).length) {
                result.errors = errors;
                d(`Local validation failed for ${action}, errors:`, errors);
                this.parent._event.emit('error', [action, errors, payload]);
                return result;
            }
        }

        /**
         * Handle the backend request
         */

        try {
            const {data} = await this.parent.http.post(Config.get('handler'), [action, payload]);

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

        if (result.errors) {
            this.parent._event.emit('error', [action, result.errors, payload]);
        }

        const end = +new Date();
        d(`Finished doing action [${action}] in [${end - start} ms], result:`, result);
        return result;
    }
}

Actions.actions = {};