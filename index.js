const axios = require('axios');
const io = require('socket.io-client');

/**
 * Default options
 * @type {{}}
 */

const defaults = {
     socket: false,
     actions: '/',
     handler: '/'
};

/**
 * Helper functions
 */

const get = (obj, path, defaultValue = false) => {
     let value = path.split('.').reduce((current, key) => (current && current.hasOwnProperty(key) ? current[key] : undefined), obj);
     return (typeof value !== 'undefined' ? value : defaultValue);
};

/**
 * Client package
 */

export class Serpent {
     constructor(path, opts = {}) {
          if (!path) {
               throw new Error('Missing required parameter `path`.')
          }

          this.path = path;
          this.intercept = [
              'login'
          ];

          this.opts = {...defaults, ...opts};
          this.onReady = false;
          this.setup();
     }

     /**
      * Intercept some reserved actions
      * @param name
      * @returns {Promise<function(*=): void>}
      * @private
      */

     async _intercept(name) {
          return async payload => {
               const {data} = await this._call(name, payload);

               if (name === 'login') {
                    if (!data.token) {
                         return;
                    }

                    localStorage.setItem('token', data.token);

                    if (this.opts.socket) {
                         this.socket.emit('login', data.token);
                    }
               }

               return data;
          };
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup() {
          this.http = axios.create({
               baseURL: this.path
          });

          if (this.opts.socket) {
               this.socket = io(this.path);
               let token = localStorage.getItem('token');

               if (token) {
                    console.log('I Have token....', token, this.socket);

                    this.socket.emit('login', token);
               }
          }

          /**
           * Load the actions and
           * create dynamic methods
           */

          if (this.opts.actions) {
               const {data} = await this.http.get(this.opts.actions);
               Serpent.actions = data;

               for (const key in data) {
                    if (!data.hasOwnProperty(key)) {
                         continue;
                    }

                    if (this.hasOwnProperty(key)) {
                         console.warn(key, 'could not register as it is already being used.');
                         continue;
                    }

                    if (this.intercept.includes(key)) {
                         this[key] = await this._intercept(key);
                         continue;
                    }


                    this[key] = async payload => {
                         return await this._call(key, payload);
                    };
               }
          }

          this.onReady && this.onReady();
     }

     /**
      * Calls an action
      * @returns
      */

     async _call(action, payload) {
          let result = {
               errors: false,
               data: false
          };

          /**
           * Do client side validation
           */

          if (Object.keys(Serpent.actions[action]).length) {

          }

          /**
           * Handle the backend request
           */

          try {
               const {data} = await this.http.post(this.opts.handler, [action, payload]);
               result.data = data;
          } catch(e) {
               const errors = get(e, 'response.data.errors', false);

               result.errors = errors ? errors : {
                    message: [
                        e.response
                    ]
               };
          }

          return result;
     }


     /**
      * After client has finished loading
      * @param handler
      */

     ready(handler) {
          this.onReady = handler;
     }
}

/**
 * Static properties
 * @type {{}}
 */

Serpent.actions = {};