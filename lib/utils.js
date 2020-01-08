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
 * Returns size of an object
 * @param object
 * @param breakSize
 * @returns {number}
 */

const sizeOf = (object, breakSize) => {
    let objectList = [];
    let stack = [ object ];
    let bytes = 0;

    while ( stack.length ) {
        let value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for(let i in value ) {
                stack.push( value[i] );
            }
        }

        if (breakSize && bytes > breakSize) {
            break;
        }
    }
    return bytes;
}

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
    return log(...args);
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

    const panel = {
        el: null,
        state: {},
        init: () => {
            panel.state = JSON.parse(localStorage.getItem('debugPanel') || 'false');

            if (!panel.state) {
                panel.state = {
                    width: '420px'
                };
            }

            panel.initHtml();
            panel.initStyle();
            panel.onLoad();
            panel.hookLoggers();
            panel.onFinish();
        },
        colorize: (data, location = 'console') => {
            if (typeof data != 'string') {
                let cache = [];
                data = JSON.stringify(data, (key, value) => {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            return;
                        }

                        cache.push(value);
                    }

                    return value;
                }, '\t');
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
        },
        initStyle: () => {
            let style = document.createElement('style');

            style.innerHTML = `
                #debugPanel {
                    z-index: 9203021;
                    position: fixed;
                    min-width: 460px;
                    word-wrap: normal;
                    border-radius: 4px;
                    color: #fff;
                    resize: both;
                    left: ${panel.state.left || '20px'};
                    top: ${panel.state.top || '20px'};
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }
                
                #debugPanel .drag-handle {
                    cursor: grab;
                }
                
                #debugPanel .welcome-message {
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    color: #f9243d;
                    font-family: Verdana;
                    display: lex;
                }
                
                #debugPanel .welcome-message div {
                    color: #4a4545;
                }
                
                #debugPanel .welcome-message span {
                    color: #30bf58;
                }
                
                #debugPanel .resize-handle {
                    cursor: se-resize;
                }
                
                #debugPanel button {
                    cursor: pointer;
                    outline: none;
                }
                
                #debugPanel .inner {
                    background: rgba(23, 22, 22, 0.92);
                    min-height: 120px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 20px 20px 0 20px;
                    ${panel.state.width ? 'width: ' + panel.state.width + ';' : ''}
                    ${panel.state.width ? 'max-width: ' + panel.state.width + ';' : ''}
                    ${panel.state.height ? 'height: ' + panel.state.height + ';' : ''}
                    max-height: 600px;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    box-shadow: 0px 20px 14px 1px rgba(0, 0, 0, 0.61);
                }
                
                #debugPanel .toggle-minimize {
                    margin-left: auto;
                }
                
                #debugPanel .controls {
                    height: 36px;
                    display: flex;
                    align-items: center;
                    background: #212021;
                    border-radius: 4px;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                    position: relative;
                }
                
                #debugPanel .debug-input {
                    height: 35px;
                    padding: 8px 14px;
                    width: 70%;
                    border: none;
                    border-bottom-left-radius: 4px;
                    background: #1c1a1a;
                    box-sizing: border-box;
                    font-size: 13px;
                    outline: none;
                    color: #a2a2a2;
                }
               
                #debugPanel .controls button {
                    background: #1b1a1a;
                    border: none;
                    border-radius: 4px;
                    color: #fff;
                    padding: 6px 11px;
                    font-weight: bold;
                    margin-right: 6px;  
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
                
                #debugPanel .inner::-webkit-scrollbar {
                  width: 5px;
                  height: 12px;
                }
                
                #debugPanel .inner::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.1);
                }
                
                #debugPanel .inner::-webkit-scrollbar-thumb {
                  background: #ffd457;
                }
                
                #debugPanel .message {
                    display: block;
                    padding: 2px 0;
                    white-space: pre-wrap;
                    font-size: 13px;
                    background: #171717;
                    margin-bottom: 10px;
                    padding: 10px;
                    border-radius: 4px;
                }
                
                #debugPanel .info {
                    color: #00a7c5;
                }
                
                #debugPanel .error {
                    color: #ff6b6b;
                }
                
                #debugPanel .warn {
                    color: #ecc54d;
                }
                
                #debugPanel .log {
                    color: #4cff85;
                }
                
                #debugPanel .object {
                    color: #619bab;
                    font-size: 12px;
                    padding: 10px;
                    display: block;
                    background: #1b1a1a;
                    margin: 6px 0;
                    border-radius: 4px;
                    max-height: 160px;
                    overflow-y: scroll;
                }
                
                #debugPanel .entity {
                    display: block;
                    word-break: break-word;
                }
                
                #debugPanel .entity + .object {
                    margin-top: 10px;
                }
            `;

            document.head.append(style);
        },
        initHtml: () => {
            panel.el = document.createElement('div');
            panel.el.id = 'debugPanel';
            document.body.appendChild(panel.el);

            panel.el.innerHTML = `
                <div class="inner">
                
                </div>
                <div class="controls">
                    <input type="text" class="debug-input" placeholder="Execute javascript or run client actions" />
                    <button class="toggle-minimize">
                        &#128469;
                    </button>
                    <button class="clear-panel">
                        &#128465;
                    </button>
                    <button class="drag-handle">
                        &#10021;
                    </button>
                    <button class="resize-handle">
                        &searr;
                     </button>
                </div>
            `;
        },
        onLoad: () => {
            let offset, mousePosition;

            let isDragDown = false;
            let isResizeDown = false;

            let dragButton = panel.el.querySelector('.drag-handle');
            let resizeButton = panel.el.querySelector('.resize-handle');
            let clearButton = panel.el.querySelector('.clear-panel');
            let minimizeToggle = panel.el.querySelector('.toggle-minimize');
            let debugInput = panel.el.querySelector('.debug-input');

            if (panel.state.minimized) {
                panel.el.querySelector('.inner').style.visibility = 'hidden';
            }

            minimizeToggle.addEventListener('click', function() {
                panel.state.minimized = !panel.state.minimized;
                panel.saveState();

                panel.el.querySelector('.inner').style.visibility =  panel.state.minimized ? 'hidden' : 'visible';
            });

            let lastCommand = '';

            debugInput.addEventListener('keyup', function(e) {
                if (e.keyCode === 38) {
                    debugInput.value = lastCommand;
                }

                if (e.keyCode === 13) {
                    try {
                        lastCommand = debugInput.value;
                        let res = eval(debugInput.value);
                        console.log(res);
                    } catch(error) {
                        console.error(error.stack);
                    }

                    debugInput.value = '';
                }
            });

            clearButton.addEventListener('click', function() {
                panel.el.querySelector('.inner').innerHTML = '';
            });

            resizeButton.addEventListener('mousedown', function(e) {
                isResizeDown = true;
            });

            document.addEventListener('mouseup', function(e) {
                isResizeDown = false;
            });

            dragButton.addEventListener('mousedown', function(e) {
                isDragDown = true;
                offset = [
                    panel.el.offsetLeft - e.clientX,
                    panel.el.offsetTop - e.clientY
                ];
            });

            document.addEventListener('mouseup', function() {
                isDragDown = false;
            });

            document.addEventListener('mousemove', function(event) {
                if (isDragDown) {
                    mousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };

                    let left = (mousePosition.x + offset[0]) + 'px';
                    let top = (mousePosition.y + offset[1]) + 'px';

                    panel.el.style.left = left;
                    panel.el.style.top = top;

                    panel.state.left = left;
                    panel.state.top = top;

                    panel.saveState();
                }

                if (isResizeDown) {
                    let width = event.clientX - panel.el.offsetLeft - 20 + 'px';
                    let height = event.clientY - panel.el.offsetTop - 55 + 'px';

                    if (parseInt(width) > 460) {
                        panel.el.querySelector('.inner').style.width = width;
                        panel.el.querySelector('.inner').style.maxWidth = width;
                        panel.state.width = width;
                    } else {
                        panel.el.querySelector('.inner').style.width = '460px';
                        panel.state.width = '460px';
                    }

                    panel.el.querySelector('.inner').style.height = height;
                    panel.state.height = height;

                    panel.saveState();
                }
            });
        },
        saveState: () => {
            localStorage.setItem('debugPanel', JSON.stringify(panel.state));
        },
        onFinish: () => {
            const inner = panel.el.querySelector('.inner');
            let version = '2.1.0';

            inner.innerHTML += ([
                '<pre class="welcome-message">',
                `
                 
           \`/+-                          
         .+++/-                         
         +++.        \`.-:-.\`            
        \`++-        -++++//+:\`          
         /+.      \`/+++:\`  \`//\`         
         \`//.   \`-+++/.     .+/         
          \`://::/+++:\`      :++         
            \`.::::-\`     \`-/++/         
                         .://-\` 
                `,
                `<div>debug: <span>${Config.get('debug')}</span>`,
                `endpoint: <span>${Config.get('handler')}</span>`,
                `version: <span>${version}</span></div>`,
                '',
                '</pre>'
            ].join('\n'));
        },
        hookLoggers: () => {
            const hooks = ['log', 'error', 'info', 'warn'];
            const inner = panel.el.querySelector('.inner');

            for (const hook of hooks) {
                let consoleLogger = console[hook];

                loggers[hook]  = (...args) => {
                    let clonedArgs = [...args];
                    let message = `<span class="message ${hook}">`;

                    for (let arg of clonedArgs) {
                        if (sizeOf(arg, 2000) > 2000) {
                            continue;
                        }

                        if (typeof arg === 'object' || Array.isArray(arg)) {
                            message += '<span class="object">';
                            message += panel.colorize(arg, 'panel');
                            message += '</span>';
                            continue;
                        }

                        message += `<span class="entity">${arg}</span>`;
                    }

                    message += `</span>`;

                    inner.innerHTML += message;
                    inner.scrollTop = inner.scrollHeight;
                };

                console[hook] = (...args) => {
                    consoleLogger(...args);
                    loggers[hook]('(console)', ' ', ...args);
                };
            }

            window.addEventListener('error', e => {
                const {message, source, lineno, colno, error} = e;
                let logger = loggers.error ? loggers.error : console.error;
                logger(`Error: ${message}. ${source}:${lineno}, ${error ? error.stack : ''}`);
            });
        }
    };

    panel.init();
};
