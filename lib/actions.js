import Config from './config';
import axios from 'axios';
import {d, get} from "./utils";

export default class Actions {
    constructor(parent) {
        this.parent = parent;
        this.setup();
    }

    makeHttpClient() {
        const options = {
            baseURL: Config.get('path')
        };

        const token = Config.get('tokenHandler').get();

        if (token) {
            options.headers = {
                Authorization: token
            };
        }

        const client = axios.create(options);

        /*client.interceptors.response.use(response => {
            return response;
        }, error => {
            // @TODO: Handle refresh token in here
            if (error.response.status === 401) {
                this.parent._auth.logout();
                let fn = Config.get('authFailed');
                typeof fn === 'function' && fn();
            }

            return error;
        });*/

        return client;
    }

    async setup() {
        const http = this.parent.http = this.makeHttpClient();

        if (!Config.get('actions')) {
            return;
        }

        const {data} = await http.get(Config.get('actions'));
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
                const {data, errors} = await this._call(key, payload);

                if (key === 'login' && data.token) {
                    Config.get('tokenHandler').set(data.token);
                    this.parent.http.defaults.headers.Authorization = data.token;

                    if (Config.get('socket')) {
                        this.parent.socket.emit('login', data.token);
                    }
                }

                if (key === 'logout') {
                    Config.get('tokenHandler').remove();
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

        d('Doing action', action, 'payload', payload);

        /**
         * Do client side validation
         */

        if (Object.keys(Actions.actions[action]).length) {
            const errors = await this.parent._validator.validate(payload, Actions.actions[action]);

            if (Object.keys(errors).length) {
                result.errors = errors;
                d('Local validation failed for', action, 'errors', errors);

                this.parent._event.emit('error', [action, errors, payload]);
                return result;
            }
        }

        /**
         * Handle the backend request
         */

        try {
            d('Sending payload to server for action', action);
            const {data} = await this.parent.http.post(Config.get('handler'), [action, payload]);
            d('Server response for action', action, ':', data);

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

        return result;
    }
}

Actions.actions = {};