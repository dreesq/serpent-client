import {d} from "./utils";

export default class Auth {
    constructor(parent) {
        this.parent = parent;
        this.user = false;
    }

    async login(payload) {
        let {data, errors} = await this.parent.login(payload);
        d('User has attempted authenticating', data, errors);

        if (errors) {
            return {data, errors};
        }

        let user = await this.parent.getUser();

        if (user.errors) {
            d('Errors while retrieving user', errors);
            return {data: user.data, errors: user.errors};
        }

        this.user = user.data;
        d('User has authenticated', this.user);
        return {data: this.user, errors: false};
    }

    async getUser() {
        let {data, errors} = await this.parent.getUser();

        if (errors) {
            return {data, errors};
        }

        this.user = data;
        return {data, errors};
    }

    logout() {
        localStorage.removeItem('token');
        delete this.parent.http.defaults.headers.Authorization;
        this.parent.socket.logout();
        d('User has logout');
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