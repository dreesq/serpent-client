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
 * Client package
 */

export class Serpent {
     constructor(path, opts = {}) {
          if (!path) {
               throw new Error('Missing required parameter `path`.')
          }

          this.path = path;
          this.opts = {...defaults, ...opts};
          this.setup();
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup() {
          this.client = axios.create({
               baseURL: this.path
          });

          if (this.opts.socket) {
               this.socket = io(this.path);
          }

          /**
           * Load the actions and
           * create dynamic methods
           */

          if (this.opts.actions) {
               const {data} = await this.client.get(this.opts.actions);
               Serpent.actions = data;

               for (const key in data) {
                    if (!data.hasOwnProperty(key)) {
                         continue;
                    }

                    if (this.hasOwnProperty(key)) {
                         continue;
                    }

                    this[key] = async payload => {
                         return await this._call(key, payload);
                    };
               }
          }
     }

     /**
      * Calls an action
      * @returns {Promise<void>}
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
               const {data} = await this.client.post(this.opts.handler, [action, payload]);
               result.data = data;
          } catch(e) {

          }

          return result;
     }
}

/**
 * Static properties
 * @type {{}}
 */

Serpent.actions = {};