import Config from './config';

/**
 * Get by key helper
 * @param obj
 * @param path
 * @param defaultValue
 * @returns {data}
 */

export const get = (obj, path, defaultValue = false) => {
    let value = path.split('.').reduce((current, key) => (current && current.hasOwnProperty(key) ? current[key] : undefined), obj);
    return (typeof value !== 'undefined' ? value : defaultValue);
};

/**
 * Debug helper
 * @param type
 * @param args
 */

const loggers = {};
export const d = (type, ...args) => {
    if (!Config.get('debug') || typeof window === 'undefined') {
        return;
    }

    let log = loggers[type] || console[type] || console.log;

    if (args.length === 1) {
        return log(...args);
    }

    for (const arg in args) {
        let current = args[arg];
        log(current);
    }
};

/**
 * Parse template helper
 * @param string
 * @param data
 * @returns {Object|void|*}
 */

export const parseTemplate = (string, data = {}) => {
    if (!string) {
        return '[empty string]';
    }

    return string.replace(/{{\s*([^}]*)\s*}}/g, (match, $1) => {
        let key = $1.trim();

        /**
         * Handle pluralization
         */

        if (key.indexOf(':') > -1) {
            let [newKey, options] = key.split(':');
            let value = +get(data, newKey, `[${newKey}]`);

            options = options.split('|');
            let index = value === 0 ? 0 : (value === 1 ? 1 : (value > 1 ? 2 : false));

            if (!isNaN(index)) {
                let result = options[index];
                return result.indexOf('_') > -1  ? result.replace(/_/g, value) : result[index];
            }
        }

        return get(data, key, `[${key}]`);
    });
};

/**
 * Shows a debug panel in DOM
 */

export const debugPanel = () => {
    /**
     * Don't run on server
     */

    if (typeof window === 'undefined') {
        return;
    }

    /**
     * Colorize helper
     * @param data
     * @param location
     * @returns {Array}
     */

    const colorize = (data, location = 'console') => {
        if (typeof data != 'string') {
            data = JSON.stringify(data, undefined, '\t');
        }

        let result = [];
        let styles = {
            string: 'color:#55c149',
            number: 'color:#b66bb2',
            boolean: 'color:#ff82a4',
            null: 'color:#ff7477',
            key: 'color:#619bab'
        };

        data = data.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
            let type = 'number';

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
            return location === 'console' ? `%c${match}%c` : `<span class="${type}">${match}</span>`;
        });

        result.unshift(data);
        return result;
    };

    const el = document.createElement('div');
    el.id = 'debugPanel';

    document.body.appendChild(el);

    let style = document.createElement('style');
    let pref = JSON.parse(localStorage.getItem('debugPanel') || '{}');

    style.innerHTML = `
        #debugPanel {
            background: #1d1d1d;
            position: fixed;
            width: 460px;
            padding: 20px;
            overflow: auto;
            word-wrap: normal;
            border-radius: 4px;
            box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
            color: #fff;
            min-height: 120px;
            max-height: 500px;
            overflow-y: auto;
            overflow-x: hidden;
            cursor: grab;
            left: ${pref.left || '20px'};
            top: ${pref.top || '20px'};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
        
        #debugPanel .number {
            color:#b66bb2
        }
        
        #debugPanel .key {
            color: #619bab;
        }
        
        #debugPanel .string {
            color:#55c149
        }
        
        #debugPanel .boolean {
            color:#ff82a4;
        }
        
        #debugPanel .null {
            color:#ff7477;
        }
        
        #debugPanel::-webkit-scrollbar {
          width: 5px;
          height: 12px;
        }
        
        #debugPanel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        #debugPanel::-webkit-scrollbar-thumb {
          background: #ffd457;
        }
        
        #debugPanel .message {
            display: block;
            padding: 2px 0;
            font: 13px Verdana, Arial, sans-serif;
            white-space: pre-wrap;
        }
        
        #debugPanel .info {
            color: #00c5b5;
        }
        
        #debugPanel .error {
            color: #ff6b6b;
        }
        
        #debugPanel .log {
            color: #4cff85;
        }
        
        #debugPanel .object {
            color: #619bab;
        }
    `;

    document.head.append(style);

    let offset, mousePosition;
    let isDown = false;

    el.addEventListener('mousedown', function(e) {
        isDown = true;
        offset = [
            el.offsetLeft - e.clientX,
            el.offsetTop - e.clientY
        ];
    }, true);

    document.addEventListener('mouseup', function() {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function(event) {
        event.preventDefault();

        if (isDown) {
            mousePosition = {
                x: event.clientX,
                y: event.clientY
            };

            let left = (mousePosition.x + offset[0]) + 'px';
            let top = (mousePosition.y + offset[1]) + 'px';

            el.style.left = left;
            el.style.top = top;
            localStorage.setItem('debugPanel', JSON.stringify({left, top}));
        }
    });

    const hooks = ['log', 'error', 'info', 'warn'];

    for (const hook of hooks) {
        loggers[hook] = (...args) => {
            let clonedArgs = [...args];
            let message = `<span class="message ${hook}">`;

            for (let arg of clonedArgs) {
                if (typeof arg === 'object' || Array.isArray(arg)) {
                    message += '<span class="object">';
                    message += colorize(arg, 'panel');
                    message += '</span>';
                    continue;
                }

                message += arg;
            }

            message += `</span>`;

            el.innerHTML += message;
            el.scrollTop = el.scrollHeight;
        };
    }

    window.onerror = (message, url, line) => {
        let logger = loggers.error ? loggers.error : console.error;
        logger(`Error: ${message}, ${url}: ${line}`);
    };

    let logger = loggers.info ? loggers.info : console.info;

    logger(`\ud83d\udc0d Welcome to (serpent-client@1.7.8)
-
debug: ${Config.get('debug')}  
endpoint: ${Config.get('path')}
-
    `);
};