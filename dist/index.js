(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Serpent = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * Get by key helper
   * @param obj
   * @param path
   * @param defaultValue
   * @returns {data}
   */

  var get = function get(obj, path) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var value = path.split('.').reduce(function (current, key) {
      return current && current.hasOwnProperty(key) ? current[key] : undefined;
    }, obj);
    return typeof value !== 'undefined' ? value : defaultValue;
  };
  /**
   * Debug helper
   * @param type
   * @param args
   */

  var d = function d(type) {
    if (!Config$1.get('debug')) {
      return;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (args.length === 1) {
      return console[type].apply(console, args);
    }

    console[type]('|| Start');

    for (var arg in args) {
      var current = args[arg];
      console[type](current);
    }

    console[type]('|| End');
  };
  /**
   * Shows a debug panel in DOM
   */

  var debugPanel = function debugPanel() {
    /**
     * Colorize helper
     * @param data
     * @param location
     * @returns {Array}
     */
    var colorize = function colorize(data) {
      var location = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'console';

      if (typeof data != 'string') {
        data = JSON.stringify(data, undefined, '\t');
      }

      var result = [];
      var styles = {
        string: 'color:#55c149',
        number: 'color:#b66bb2',
        "boolean": 'color:#ff82a4',
        "null": 'color:#ff7477',
        key: 'color:#619bab'
      };
      data = data.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var type = 'number';

        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            type = 'key';
          } else {
            type = 'string';
          }
        } else if (/true|false/.test(match)) {
          type = 'boolean';
        } else if (/null/.test(match)) {
          type = 'null';
        }

        location === 'console' && result.push(styles[type], '');
        return location === 'console' ? "%c".concat(match, "%c") : "<span class=\"".concat(type, "\">").concat(match, "</span>");
      });
      result.unshift(data);
      return result;
    };

    var el = document.createElement('pre');
    el.id = 'debugPanel';
    document.body.appendChild(el);
    var hooks = ['log', 'error', 'info', 'warn'];
    var style = document.createElement('style');
    var pref = JSON.parse(localStorage.getItem('debugPanel') || '{}');
    style.innerHTML = "\n        #debugPanel {\n            background: #353535;\n            position: absolute;\n            width: 460px;\n            padding: 20px;\n            overflow: auto;\n            word-wrap: normal;\n            color: #fff;\n            height: 250px;\n            overflow-y: auto;\n            overflow-x: hidden;\n            cursor: grab;\n            left: ".concat(pref.left || '20px', ";\n            top: ").concat(pref.top || '20px', ";\n            box-shadow: 0px 0px 8px 1px #000;\n        }\n        \n        #debugPanel .number {\n            color:#b66bb2\n        }\n        \n        #debugPanel .key {\n            color: #619bab;\n        }\n        \n        #debugPanel .string {\n            color:#55c149\n        }\n        \n        #debugPanel .boolean {\n            color:#ff82a4;\n        }\n        \n        #debugPanel .null {\n            color:#ff7477;\n        }\n        \n        #debugPanel::-webkit-scrollbar {\n          width: 5px;\n          height: 12px;\n        }\n        \n        #debugPanel::-webkit-scrollbar-track {\n          background: rgba(0, 0, 0, 0.1);\n        }\n        \n        #debugPanel::-webkit-scrollbar-thumb {\n          background: #ffd457;\n        }\n        \n        #debugPanel .message {\n            display: block;\n            padding: 2px 0;\n            font: 13px Verdana, Arial, sans-serif;\n        }\n        \n        #debugPanel .info {\n            color: #60f6ff;\n        }\n        \n        #debugPanel .error {\n            color: #ff6b6b;\n        }\n        \n        #debugPanel .log {\n            color: #4cff85;\n        }\n        \n        #debugPanel .object {\n            color: #619bab;\n        }\n    ");
    document.head.append(style);
    var offset, mousePosition;
    var isDown = false;
    el.addEventListener('mousedown', function (e) {
      isDown = true;
      offset = [el.offsetLeft - e.clientX, el.offsetTop - e.clientY];
    }, true);
    document.addEventListener('mouseup', function () {
      isDown = false;
    }, true);
    document.addEventListener('mousemove', function (event) {
      event.preventDefault();

      if (isDown) {
        mousePosition = {
          x: event.clientX,
          y: event.clientY
        };
        var left = mousePosition.x + offset[0] + 'px';
        var top = mousePosition.y + offset[1] + 'px';
        el.style.left = left;
        el.style.top = top;
        localStorage.setItem('debugPanel', JSON.stringify({
          left: left,
          top: top
        }));
      }
    });

    var _loop = function _loop() {
      var hook = _hooks[_i];
      var logger = console[hook];

      console[hook] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var clonedArgs = [].concat(args);
        var consoleResult = [];

        for (var arg in clonedArgs) {
          if (_typeof(clonedArgs[arg]) === 'object' || Array.isArray(clonedArgs[arg])) {
            consoleResult.push.apply(consoleResult, _toConsumableArray(colorize(clonedArgs[arg])));
            continue;
          }

          consoleResult.push(clonedArgs[arg]);
        }

        logger.apply(void 0, consoleResult);
        var message = "<span class=\"message ".concat(hook, "\">");

        for (var _i2 = 0, _args = args; _i2 < _args.length; _i2++) {
          var _arg = _args[_i2];

          if (_typeof(_arg) === 'object' || Array.isArray(_arg)) {
            message += '<span class="object">';
            message += colorize(_arg, 'panel');
            message += '</span>';
            continue;
          }

          message += _arg;
        }

        message += "</span>";
        el.innerHTML += message;
        el.scrollTop = el.scrollHeight;
      };
    };

    for (var _i = 0, _hooks = hooks; _i < _hooks.length; _i++) {
      _loop();
    }

    window.onerror = function (message, url, line) {
      console.error("Error: ".concat(message, ", ").concat(url, ": ").concat(line));
    };
  };

  var Utils = /*#__PURE__*/Object.freeze({
    get: get,
    d: d,
    debugPanel: debugPanel
  });

  var Config =
  /*#__PURE__*/
  function () {
    function Config() {
      _classCallCheck(this, Config);

      this.storage = {};
    }

    _createClass(Config, [{
      key: "store",
      value: function store(data) {
        this.storage = data;
      }
    }, {
      key: "get",
      value: function get$1(key, defaultValue) {
        return get(this.storage, key, defaultValue);
      }
    }]);

    return Config;
  }();

  var Config$1 = new Config();

  var Socket =
  /*#__PURE__*/
  function () {
    function Socket(parent, client) {
      _classCallCheck(this, Socket);

      this.parent = parent;

      if (!Config$1.get('socket')) {
        return parent._event.emit('loaded');
      }

      this.socket = client(Config$1.get('path'));
      this.parent.socket = this.socket;
      this.setup();
    }

    _createClass(Socket, [{
      key: "setup",
      value: function setup() {
        var _this = this;

        var tokenHandler = Config$1.get('tokenHandler');
        var token = tokenHandler.get('token');

        if (token) {
          d('info', 'Authenticating socket.');
          this.socket.emit('login', token);
        }

        this.socket.on('reconnect', function () {
          d('info', 'Socket has reconnected');

          _this.socket.emit('login', token);
        });
        this.socket.on('login', function () {
          d('info', 'Socket has logged in');
        });

        this.parent._event.emit('loaded');
      }
    }, {
      key: "logout",
      value: function logout() {
        this.socket.emit('logout');
      }
    }]);

    return Socket;
  }();

  var Actions =
  /*#__PURE__*/
  function () {
    function Actions(parent, client) {
      _classCallCheck(this, Actions);

      this.parent = parent;
      this.httpClient = client;
      this.setup();
    }

    _createClass(Actions, [{
      key: "_isLogout",
      value: function _isLogout(config) {
        var isLogout = config.url.indexOf('logout') > -1;

        if (!isLogout) {
          try {
            var _JSON$parse = JSON.parse(config.data),
                _JSON$parse2 = _slicedToArray(_JSON$parse, 2),
                action = _JSON$parse2[0],
                payload = _JSON$parse2[1];

            isLogout = action === 'logout';
          } catch (_unused) {}
        }

        return isLogout;
      }
    }, {
      key: "makeHttpClient",
      value: function makeHttpClient() {
        var _this = this;

        var options = {
          baseURL: Config$1.get('path')
        };
        var tokenHandler = Config$1.get('tokenHandler');
        var token = tokenHandler.get('token');

        if (token) {
          options.headers = {
            Authorization: token
          };
        }

        var client = this.httpClient.create(options);

        var onAuthFailed = function onAuthFailed() {
          _this.parent._auth.logout();

          var fn = Config$1.get('authFailed');
          typeof fn === 'function' && fn();
        };

        client.interceptors.response.use(function (response) {
          return response;
        },
        /*#__PURE__*/
        function () {
          var _ref = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(error) {
            var refreshToken, _ref2, data, errors;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(error.response && error.response.status === 401 && !_this._isLogout(error.config))) {
                      _context.next = 19;
                      break;
                    }

                    refreshToken = tokenHandler.get('refresh');

                    if (!refreshToken) {
                      _context.next = 18;
                      break;
                    }

                    d('info', 'Attempting token refresh');
                    _context.next = 6;
                    return _this.parent.refreshToken({
                      token: refreshToken
                    });

                  case 6:
                    _ref2 = _context.sent;
                    data = _ref2.data;
                    errors = _ref2.errors;

                    if (!errors) {
                      _context.next = 12;
                      break;
                    }

                    onAuthFailed();
                    return _context.abrupt("return", error);

                  case 12:
                    /**
                     * Update the tokens
                     */
                    d('info', 'Successfully refreshed token, retrying request.');
                    tokenHandler.set('token', data.token);
                    tokenHandler.set('refresh', data.refresh);
                    _this.parent.http.defaults.headers.Authorization = data.token;
                    /**
                     * Retry the request
                     */

                    error.config.headers.Authorization = data.token;
                    return _context.abrupt("return", client.request(error.config));

                  case 18:
                    onAuthFailed();

                  case 19:
                    return _context.abrupt("return", Promise.reject(error));

                  case 20:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }());
        return client;
      }
    }, {
      key: "setup",
      value: function () {
        var _setup = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var _this2 = this;

          var http, data, _ref3, actions, _loop, key, _ret;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  http = this.parent.http = this.makeHttpClient();

                  if (Config$1.get('actions')) {
                    _context3.next = 3;
                    break;
                  }

                  return _context3.abrupt("return");

                case 3:
                  data = {};
                  _context3.prev = 4;
                  _context3.next = 7;
                  return http.get(Config$1.get('actions'));

                case 7:
                  _ref3 = _context3.sent;
                  actions = _ref3.data;
                  data = actions;
                  _context3.next = 16;
                  break;

                case 12:
                  _context3.prev = 12;
                  _context3.t0 = _context3["catch"](4);
                  d('error', 'Could not load actions list.');

                  this.parent._event.emit('error', ['init', _context3.t0]);

                case 16:
                  Actions.actions = data;

                  _loop = function _loop(key) {
                    if (!data.hasOwnProperty(key)) {
                      return "continue";
                    }

                    if (_this2.hasOwnProperty(key)) {
                      d('warn', "Could not register ".concat(key, " as it is already being used."));
                      return "continue";
                    }

                    _this2.parent[key] =
                    /*#__PURE__*/
                    function () {
                      var _ref4 = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee2(payload) {
                        var tokenHandler, _ref5, data, errors;

                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                tokenHandler = Config$1.get('tokenHandler');
                                _context2.next = 3;
                                return _this2._call(key, payload);

                              case 3:
                                _ref5 = _context2.sent;
                                data = _ref5.data;
                                errors = _ref5.errors;

                                if (key === 'login' && data.token) {
                                  tokenHandler.set('token', data.token);
                                  _this2.parent.http.defaults.headers.Authorization = data.token;

                                  if (Config$1.get('refresh')) {
                                    tokenHandler.set('refresh', data.refresh);
                                  }

                                  if (Config$1.get('socket')) {
                                    _this2.parent.socket.emit('login', data.token);
                                  }
                                }

                                if (key === 'logout') {
                                  tokenHandler.remove('token');
                                  tokenHandler.remove('refresh');
                                  _this2.parent.http.defaults.headers.Authorization = null;

                                  if (Config$1.get('socket')) {
                                    _this2.parent.socket.emit('logout');
                                  }
                                }

                                return _context2.abrupt("return", {
                                  data: data,
                                  errors: errors
                                });

                              case 9:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2);
                      }));

                      return function (_x2) {
                        return _ref4.apply(this, arguments);
                      };
                    }();
                  };

                  _context3.t1 = regeneratorRuntime.keys(data);

                case 19:
                  if ((_context3.t2 = _context3.t1()).done) {
                    _context3.next = 26;
                    break;
                  }

                  key = _context3.t2.value;
                  _ret = _loop(key);

                  if (!(_ret === "continue")) {
                    _context3.next = 24;
                    break;
                  }

                  return _context3.abrupt("continue", 19);

                case 24:
                  _context3.next = 19;
                  break;

                case 26:
                  this.parent._event.emit('loaded');

                case 27:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this, [[4, 12]]);
        }));

        function setup() {
          return _setup.apply(this, arguments);
        }

        return setup;
      }()
      /**
       * Call an action
       * @returns {Promise<function(*=): void>}
       * @private
       */

    }, {
      key: "_call",
      value: function () {
        var _call2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(action) {
          var payload,
              result,
              start,
              errors,
              _ref6,
              data,
              _errors,
              end,
              _args4 = arguments;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  payload = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};
                  result = {
                    errors: false,
                    data: false
                  };
                  start = +new Date();
                  d('info', "Doing action [".concat(action, "], sent payload:"), payload);
                  /**
                   * Do client side validation
                   */

                  if (!(Actions.actions[action] && Object.keys(Actions.actions[action]).length)) {
                    _context4.next = 13;
                    break;
                  }

                  _context4.next = 7;
                  return this.parent._validator.validate(payload, Actions.actions[action]);

                case 7:
                  errors = _context4.sent;

                  if (!Object.keys(errors).length) {
                    _context4.next = 13;
                    break;
                  }

                  result.errors = errors;
                  d('info', "Local validation failed for [".concat(action, "], errors:"), errors);

                  this.parent._event.emit('error', [action, errors, payload]);

                  return _context4.abrupt("return", result);

                case 13:
                  _context4.prev = 13;
                  _context4.next = 16;
                  return this.parent.http.post(Config$1.get('handler'), [action, payload]);

                case 16:
                  _ref6 = _context4.sent;
                  data = _ref6.data;

                  if (data && data.errors) {
                    result.errors = data.errors;
                  } else {
                    result.data = data;
                  }

                  _context4.next = 25;
                  break;

                case 21:
                  _context4.prev = 21;
                  _context4.t0 = _context4["catch"](13);
                  _errors = get(_context4.t0, 'response.data.errors', false);
                  result.errors = _errors ? _errors : {
                    message: [_context4.t0.response]
                  };

                case 25:
                  if (result.errors) {
                    this.parent._event.emit('error', [action, result.errors, payload]);
                  }

                  end = +new Date();
                  d('info', "Finished doing action [".concat(action, "] in [").concat(end - start, " ms], result:"), result);
                  return _context4.abrupt("return", result);

                case 29:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this, [[13, 21]]);
        }));

        function _call(_x3) {
          return _call2.apply(this, arguments);
        }

        return _call;
      }()
    }]);

    return Actions;
  }();
  Actions.actions = {};

  var Auth =
  /*#__PURE__*/
  function () {
    function Auth(parent) {
      _classCallCheck(this, Auth);

      this.parent = parent;
      this.user = false;
    }

    _createClass(Auth, [{
      key: "login",
      value: function () {
        var _login = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(payload) {
          var _ref, data, errors, user;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return this.parent.login(_objectSpread({}, payload, {
                    refresh: Config$1.get('refresh') ? 1 : 0
                  }));

                case 2:
                  _ref = _context.sent;
                  data = _ref.data;
                  errors = _ref.errors;

                  if (!errors) {
                    _context.next = 7;
                    break;
                  }

                  return _context.abrupt("return", {
                    data: data,
                    errors: errors
                  });

                case 7:
                  _context.next = 9;
                  return this.parent.getUser();

                case 9:
                  user = _context.sent;

                  if (!user.errors) {
                    _context.next = 12;
                    break;
                  }

                  return _context.abrupt("return", {
                    data: user.data,
                    errors: user.errors
                  });

                case 12:
                  this.user = user.data;
                  return _context.abrupt("return", {
                    data: this.user,
                    errors: false
                  });

                case 14:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function login(_x) {
          return _login.apply(this, arguments);
        }

        return login;
      }()
    }, {
      key: "getUser",
      value: function () {
        var _getUser = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          var _ref2, data, errors;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return this.parent.getUser();

                case 2:
                  _ref2 = _context2.sent;
                  data = _ref2.data;
                  errors = _ref2.errors;

                  if (!errors) {
                    _context2.next = 7;
                    break;
                  }

                  return _context2.abrupt("return", {
                    data: data,
                    errors: errors
                  });

                case 7:
                  this.user = data;
                  return _context2.abrupt("return", {
                    data: data,
                    errors: errors
                  });

                case 9:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function getUser() {
          return _getUser.apply(this, arguments);
        }

        return getUser;
      }()
    }, {
      key: "logout",
      value: function () {
        var _logout = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var tokenHandler, _ref3, errors, data;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  d('info', 'Attempting to logout');
                  tokenHandler = Config$1.get('tokenHandler');
                  _context3.next = 4;
                  return this.parent.logout();

                case 4:
                  _ref3 = _context3.sent;
                  errors = _ref3.errors;
                  data = _ref3.data;
                  this.user = false;
                  tokenHandler.remove('token');
                  tokenHandler.remove('refresh');
                  d('info', 'User has logout');

                case 11:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function logout() {
          return _logout.apply(this, arguments);
        }

        return logout;
      }()
    }, {
      key: "is",
      value: function is(role) {
        if (!this.user) {
          return false;
        }

        return this.user.role === role;
      }
    }, {
      key: "can",
      value: function can(permission) {
        if (!this.user) {
          return false;
        }

        return this.user.permissions.hasOwnProperty(permission);
      }
    }]);

    return Auth;
  }();

  var Event =
  /*#__PURE__*/
  function () {
    function Event() {
      _classCallCheck(this, Event);

      this.events = {};
    }

    _createClass(Event, [{
      key: "on",
      value: function on(event, listener) {
        var _this = this;

        if (_typeof(this.events[event]) !== 'object') {
          this.events[event] = [];
        }

        this.events[event].push(listener);
        d('info', "Registering event ".concat(event));
        return function () {
          return _this.removeListener(event, listener);
        };
      }
    }, {
      key: "removeListener",
      value: function removeListener(event, listener) {
        if (_typeof(this.events[event]) !== 'object') {
          return;
        }

        var idx = this.events[event].indexOf(listener);

        if (idx > -1) {
          this.events[event].splice(idx, 1);
        }
      }
    }, {
      key: "emit",
      value: function emit(event) {
        var _this2 = this;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (_typeof(this.events[event]) === 'object') {
          this.events[event].forEach(function (listener) {
            d('info', "Calling event [".concat(event, "], payload:"), args);
            listener.apply(_this2, args);
          });
        }
      }
    }, {
      key: "once",
      value: function once(event, listener) {
        var _this3 = this;

        var remove = this.on(event, function () {
          remove();

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          listener.apply(_this3, args);
        });
      }
    }]);

    return Event;
  }();

  /**
   * Validator rules
   * @type {{}}
   */
  var allRules = {
    email: function email(value) {
      var re = /\S+@\S+\.\S+/;

      if (!re.test(value)) {
        return 'validation.email';
      }
    },
    required: function required(value) {
      if (typeof value === 'undefined') {
        return 'validation.required';
      }
    },
    string: function string(value) {
      if (typeof value !== 'string') {
        return 'validation.string';
      }
    },
    min: function min(value, field, opts) {
      if (typeof value === 'string' && value.length < Number(opts[0])) {
        return 'validation.min';
      }

      if (typeof value === 'number' && value < Number(opts[0])) {
        return 'validation.min';
      }
    },
    max: function max(value, field, opts) {
      if (typeof value === 'string' && value.length > Number(opts[0])) {
        return 'validation.max';
      }

      if (typeof value === 'number' && value > Number(opts[0])) {
        return 'validation.max';
      }
    },
    number: function number(value) {
      if (typeof value !== 'number') {
        return 'validation.number';
      }
    },
    when: function when(value, key, options, allInput) {
      var _options = _slicedToArray(options, 2),
          required = _options[0],
          field = _options[1];

      var shouldEqual = field[0] !== '!';

      if (shouldEqual && allInput[required] && allInput[required] == field) {
        return allRules.required.apply(allRules, arguments);
      }

      if (!shouldEqual && allInput[required] && allInput[required] != field.substring(1, field.length)) {
        return allRules.required.apply(allRules, arguments);
      }
    },
    file: function () {
      var _file = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(value) {
        var items, invalid, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                items = Array.isArray(value) ? value : [value];
                invalid = false;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 5;

                for (_iterator = items[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  item = _step.value;

                  if (_typeof(item) !== 'object' || !item.isFile) {
                    invalid = true;
                  }
                }

                _context.next = 13;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](5);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 13:
                _context.prev = 13;
                _context.prev = 14;

                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }

              case 16:
                _context.prev = 16;

                if (!_didIteratorError) {
                  _context.next = 19;
                  break;
                }

                throw _iteratorError;

              case 19:
                return _context.finish(16);

              case 20:
                return _context.finish(13);

              case 21:
                if (!invalid) {
                  _context.next = 23;
                  break;
                }

                return _context.abrupt("return", 'validation.file');

              case 23:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[5, 9, 13, 21], [14,, 16, 20]]);
      }));

      function file(_x) {
        return _file.apply(this, arguments);
      }

      return file;
    }(),
    ext: function () {
      var _ext = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(value, key, options) {
        var invalidFile, invalid, items, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, item, _ext2;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return allRules.file(value, key);

              case 2:
                invalidFile = _context2.sent;
                invalid = false;

                if (!invalidFile) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", invalidFile);

              case 6:
                items = Array.isArray(value) ? value : [value];
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 10;

                for (_iterator2 = items[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  item = _step2.value;
                  _ext2 = item.filename.substr(item.filename.lastIndexOf('.') + 1);

                  if (options.indexOf(_ext2) === -1) {
                    invalid = true;
                  }
                }

                _context2.next = 18;
                break;

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](10);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 18:
                _context2.prev = 18;
                _context2.prev = 19;

                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }

              case 21:
                _context2.prev = 21;

                if (!_didIteratorError2) {
                  _context2.next = 24;
                  break;
                }

                throw _iteratorError2;

              case 24:
                return _context2.finish(21);

              case 25:
                return _context2.finish(18);

              case 26:
                if (!invalid) {
                  _context2.next = 28;
                  break;
                }

                return _context2.abrupt("return", 'validation.extension');

              case 28:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[10, 14, 18, 26], [19,, 21, 25]]);
      }));

      function ext(_x2, _x3, _x4) {
        return _ext.apply(this, arguments);
      }

      return ext;
    }(),
    date: function date(value) {
      var isValid = new Date(value) !== "Invalid Date" && !isNaN(new Date(value));

      if (!isValid) {
        return 'validation.date';
      }
    }
  };

  var Validator =
  /*#__PURE__*/
  function () {
    function Validator() {
      _classCallCheck(this, Validator);
    }

    _createClass(Validator, [{
      key: "registerRule",
      value: function registerRule(key, handler) {
        allRules[key] = handler;
      }
    }, {
      key: "validateField",
      value: function () {
        var _validateField = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(inputValue, inputKey, rules, allInput) {
          var split, validations, messages;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  split = rules.split('|');
                  validations = split.map(function (key) {
                    var _key$split = key.split(':'),
                        _key$split2 = _slicedToArray(_key$split, 2),
                        ruleName = _key$split2[0],
                        _key$split2$ = _key$split2[1],
                        opts = _key$split2$ === void 0 ? '' : _key$split2$;

                    if (!allRules[ruleName] || ['when', 'required'].indexOf(ruleName) === -1 && !inputValue) {
                      return;
                    }

                    return allRules[ruleName](inputValue, inputKey, opts.split(','), allInput);
                  });
                  _context3.next = 4;
                  return Promise.all(validations);

                case 4:
                  messages = _context3.sent;
                  return _context3.abrupt("return", messages.filter(function (message) {
                    return message !== undefined;
                  }));

                case 6:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        function validateField(_x5, _x6, _x7, _x8) {
          return _validateField.apply(this, arguments);
        }

        return validateField;
      }()
    }, {
      key: "validate",
      value: function () {
        var _validate = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(values, rules) {
          var valid, errors, key, errorsList;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  valid = true;
                  errors = {};
                  _context4.t0 = regeneratorRuntime.keys(rules);

                case 3:
                  if ((_context4.t1 = _context4.t0()).done) {
                    _context4.next = 13;
                    break;
                  }

                  key = _context4.t1.value;

                  if (rules.hasOwnProperty(key)) {
                    _context4.next = 7;
                    break;
                  }

                  return _context4.abrupt("continue", 3);

                case 7:
                  _context4.next = 9;
                  return this.validateField(values[key], key, rules[key], values);

                case 9:
                  errorsList = _context4.sent;

                  if (errorsList.length) {
                    errors[key] = errorsList;
                    valid = false;
                  }

                  _context4.next = 3;
                  break;

                case 13:
                  return _context4.abrupt("return", valid ? valid : errors);

                case 14:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function validate(_x9, _x10) {
          return _validate.apply(this, arguments);
        }

        return validate;
      }()
    }]);

    return Validator;
  }();

  /**
   * Default options
   * @type {{}}
   */

  var defaults = {
    debug: false,
    socket: false,
    actions: '/',
    handler: '/',
    refresh: true,
    authFailed: false,
    tokenHandler: {
      get: function get(key) {
        return localStorage.getItem(key);
      },
      set: function set(key, token) {
        localStorage.setItem(key, token);
      },
      remove: function remove(key) {
        localStorage.removeItem(key);
      }
    }
  };
  alert('x');
  /**
   * Client package
   */

  var Serpent =
  /*#__PURE__*/
  function () {
    function Serpent(path) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Serpent);

      if (!path) {
        throw new Error('Missing required parameter `path`.');
      }

      this.loaded = 0;
      this.opts = _objectSpread({}, defaults, opts, {
        path: path
      });
      Config$1.store(this.opts);
      this.onReady = false;
      this.setup()["catch"](d);
    }
    /**
     * Setup the client
     * @returns {Promise<void>}
     */


    _createClass(Serpent, [{
      key: "setup",
      value: function () {
        var _setup = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          var _this = this;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  this._event = new Event();

                  this._event.on('loaded', function () {
                    ++_this.loaded;

                    if (_this.loaded === 2) {
                      d('info', 'Client successfully loaded. Running onReady hook if it exists.');
                      typeof _this.onReady === 'function' && _this.onReady();
                    }
                  });

                  this._auth = new Auth(this);
                  this._actions = new Actions(this);
                  new Socket(this);
                  this._validator = new Validator();
                  this._utils = Utils;
                  this._config = Config$1;

                case 8:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function setup() {
          return _setup.apply(this, arguments);
        }

        return setup;
      }()
      /**
       * After client has finished loading
       * @param handler
       */

    }, {
      key: "ready",
      value: function ready(handler) {
        this.onReady = handler;
      }
      /**
       * Call action shortcut
       * @param action
       * @param payload
       * @returns {Promise<function(*=): void>}
       */

    }, {
      key: "call",
      value: function call(action, payload) {
        return this._actions._call(action, payload);
      }
    }]);

    return Serpent;
  }();
  Serpent.actions = {};

  return Serpent;

}));
