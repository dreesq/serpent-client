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
            return;
        }

        let user = await this.parent.getUser();

        if (user.errors) {
            d('Errors while retrieving user', errors);
            return;
        }

        this.user = user.data;
        d('User has authenticated', this.user);
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