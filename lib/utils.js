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

    const panel = {
        el: null,
        state: {},
        init: () => {
            panel.state = JSON.parse(localStorage.getItem('debugPanel') || '{}');

            panel.initHtml();
            panel.initStyle();
            panel.onLoad();
            panel.hookLoggers();
            panel.onFinish();
        },
        colorize: (data, location = 'console') => {
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
        },
        initStyle: () => {
            let style = document.createElement('style');

            style.innerHTML = `
                #debugPanel {
                    background: #1d1d1d;
                    z-index: 1337;
                    position: fixed;
                    min-width: 460px;
                    word-wrap: normal;
                    border-radius: 4px;
                    box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
                    color: #fff;
                    resize: both;
                    left: ${panel.state.left || '20px'};
                    top: ${panel.state.top || '20px'};
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }
                
                #debugPanel .drag-handle {
                    cursor: grab;
                }
                
                #debugPanel .resize-handle {
                    cursor: se-resize;
                }
                
                #debugPanel button {
                    cursor: pointer;
                    outline: none;
                }
                
                #debugPanel .inner {
                    min-height: 120px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 20px 20px 0 20px;
                    ${panel.state.width ? 'width: ' + panel.state.width + ';' : ''}
                    ${panel.state.height ? 'height: ' + panel.state.height + ';' : ''}
                }
                
                #debugPanel .controls {
                    height: 50px;
                    display: flex;
                    align-items: center;
                    float: right;
                }
               
                #debugPanel .controls button {
                    background: #ffd457;
                    border: none;
                    border-radius: 4px;
                    color: #1d1d1d;
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
        },
        initHtml: () => {
            panel.el = document.createElement('div');
            panel.el.id = 'debugPanel';
            document.body.appendChild(panel.el);

            panel.el.innerHTML = `
                <div class="inner">
                
                </div>
                <div class="controls">
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

            minimizeToggle.addEventListener('click', function() {
                panel.state.minimized = !panel.state.minimized;
                panel.saveState();

                panel.el.querySelector('.inner').style.display =  panel.state.minimized ? 'none' : 'block';
            });

            clearButton.addEventListener('click', function() {
                panel.el.querySelector('.inner').innerHTML = '';
            });

            resizeButton.addEventListener('mousedown', function(e) {
                isResizeDown = true;
            }, false);

            document.addEventListener('mouseup', function(e) {
                isResizeDown = false;
            }, false);

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
                event.preventDefault();

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
            let logger = loggers.info ? loggers.info : console.info;
            logger([

                '\ud83d\udc0d Welcome to (serpent-client@1.7.9)',
                '',
                '-',
                `debug: <span style="color: #fff;">${Config.get('debug')}</span>`,
                `endpoint: <span style="color: #fff;">${Config.get('path')}</span>`,
                '-',
                '',
                ''
            ].join('\n'));
        },
        hookLoggers: () => {
            const hooks = ['log', 'error', 'info', 'warn'];
            const inner = panel.el.querySelector('.inner');

            for (const hook of hooks) {
                loggers[hook] = (...args) => {
                    let clonedArgs = [...args];
                    let message = `<span class="message ${hook}">`;

                    for (let arg of clonedArgs) {
                        if (typeof arg === 'object' || Array.isArray(arg)) {
                            message += '<span class="object">';
                            message += panel.colorize(arg, 'panel');
                            message += '</span>';
                            continue;
                        }

                        message += arg;
                    }

                    message += `</span>`;

                    inner.innerHTML += message;
                    inner.scrollTop = inner.scrollHeight;
                };
            }

            window.onerror = (message, url, line) => {
                let logger = loggers.error ? loggers.error : console.error;
                logger(`Error: ${message}, ${url}: ${line}`);
            };
        }
    };

    panel.init();
};