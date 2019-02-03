import Socket from './lib/socket';
import Actions from './lib/actions';
import Config from './lib/config';
import Auth from './lib/auth';
import Event from './lib/event';
import Validator from './lib/validator';
import * as Utils from './lib/utils';

/**
 * Default options
 * @type {{}}
 */

const defaults = {
     debug: false,
     socket: false,
     actions: '/',
     handler: '/'
};

/**
 * Client package
 */

export default class Serpent {
     constructor(path, opts = {}) {
          if (!path) {
               throw new Error('Missing required parameter `path`.')
          }

          this.opts = {
               ...defaults,
               ...opts,
               path
          };

          Config.store(this.opts);
          this.onReady = false;
          this.setup().catch(Utils.d);
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup() {
          new Actions(this);
          new Socket(this);
          this._auth = new Auth(this);
          this._validator = new Validator();
          this._event = new Event();
          this._utils = Utils;
          this._config = Config;

          typeof this.onReady === 'function' && this.onReady();
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