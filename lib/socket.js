import io from 'socket.io-client';
import Config from './config';

export default class Socket {
    constructor(parent) {
        if (!Config.get('socket')) {
            return;
        }

        this.socket = io(Config.get('path'));
        this.parent = parent;
        this.parent.socket = this.socket;
        this.setup();
    }

    setup() {
        const token = localStorage.getItem('token');

        if (token) {
            this.socket.emit('login', token);
        }

        this.socket.on('reconnect', () => {
            this.socket.emit('login', token);
        });
    }

    logout() {
        this.socket.emit('logout');
    }
}