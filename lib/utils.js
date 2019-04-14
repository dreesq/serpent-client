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

export const d = (type, ...args) => {
    if (!Config.get('debug')) {
        return;
    }

    if (args.length === 1) {
        return console[type].apply(console, args);
    }

    console[type]('|| Start');

    for (const arg in args) {
        let current = args[arg];
        console[type](current);
    }

    console[type]('|| End');
};

/**
 * Shows a debug panel in DOM
 */

export const debugPanel = () => {
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

    const el = document.createElement('pre');
    el.id = 'debugPanel';
    document.body.appendChild(el);

    const hooks = ['log', 'error', 'info', 'warn'];

    let style = document.createElement('style');
    let pref = JSON.parse(localStorage.getItem('debugPanel') || '{}');

    style.innerHTML = `
        #debugPanel {
            background: #353535;
            position: absolute;
            width: 460px;
            padding: 20px;
            overflow: auto;
            word-wrap: normal;
            color: #fff;
            height: 250px;
            overflow-y: auto;
            overflow-x: hidden;
            cursor: grab;
            left: ${pref.left || '20px'};
            top: ${pref.top || '20px'};
            box-shadow: 0px 0px 8px 1px #000;
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
        }
        
        #debugPanel .info {
            color: #60f6ff;
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

    for (const hook of hooks) {
        const logger = console[hook];

        console[hook] = (...args) => {
            let clonedArgs = [...args];
            let consoleResult = [];

            for (let arg in clonedArgs) {
                if (typeof clonedArgs[arg] === 'object' || Array.isArray(clonedArgs[arg])) {
                    consoleResult.push(...colorize(clonedArgs[arg]));
                    continue;
                }

                consoleResult.push(clonedArgs[arg]);
            }

            logger(...consoleResult);
            let message = `<span class="message ${hook}">`;

            for (let arg of args) {
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
        console.error(`Error: ${message}, ${url}: ${line}`);
    };
};