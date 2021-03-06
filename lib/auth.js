import {d} from "./utils";
import Config from './config';

export default class Auth {
    constructor(parent) {
        this.parent = parent;
        this.user = false;
    }

    async login(payload) {
        let {data, errors} = await this.parent.login(payload);

        if (errors) {
            return {data, errors};
        }

        let user = await this.parent.getUser();

        if (user.errors) {
            return {
                data: user.data,
                errors: user.errors
            };
        }

        this.user = user.data;
        return {
            data: this.user,
            errors: false
        };
    }

    async getUser() {
        let {data, errors} = await this.parent.getUser();

        if (errors) {
            return {
                data,
                errors
            };
        }

        this.user = data;
        return {
            data,
            errors
        };
    }

    async logout() {
        d('info', '+ running (logout)');
        const tokenHandler = Config.get('tokenHandler');

        if (!tokenHandler.get('token')) {
            return {
                data: {
                    success: true
                },
                errors: false
            };
        }

        const {errors, data} = await this.parent.logout();
        this.user = false;
        const cache = this.parent.getCache();

        if (cache.getUser) {
            delete cache.getUser;
        }

        tokenHandler.remove('token');
        tokenHandler.remove('refresh');
        d('info', '(ok) logout');

        return {
            errors,
            data
        };
    }

    is(role) {
        if (!this.user) {
            return false;
        }

        return this.user.role === role;
    }

    can(permission) {
        if (!this.user) {
            return false;
        }

        return this.user.permissions.hasOwnProperty(permission);
    }
}
