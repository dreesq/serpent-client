(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Serpent = factory());
}(this, (function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _typeof_1 = createCommonjsModule(function (module) {
	  function _typeof(obj) {
	    "@babel/helpers - typeof";

	    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	      module.exports = _typeof = function _typeof(obj) {
	        return typeof obj;
	      };
	    } else {
	      module.exports = _typeof = function _typeof(obj) {
	        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	      };
	    }

	    return _typeof(obj);
	  }

	  module.exports = _typeof;
	});

	var runtime_1 = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */
	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.

	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        prototype[method] = function (arg) {
	          return this._invoke(method, arg);
	        };
	      });
	    }

	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;

	        if (!(toStringTagSymbol in genFun)) {
	          genFun[toStringTagSymbol] = "GeneratorFunction";
	        }
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && _typeof_1(value) === "object" && hasOwn.call(value, "__await")) {
	            return Promise.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return Promise.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new Promise(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    exports.async = function (innerFn, outerFn, self, tryLocsList) {
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };

	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }

	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


	          return doneResult();
	        }

	        context.method = method;
	        context.arg = arg;

	        while (true) {
	          var delegate = context.delegate;

	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);

	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }

	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }

	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }

	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);

	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }

	        return ContinueSentinel;
	      }

	      var record = tryCatch(method, delegate.iterator, context.arg);

	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      var info = record.arg;

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }

	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }

	      this.tryEntries.push(entry);
	    }

	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }

	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    exports.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.


	        next.done = true;
	        return next;
	      };
	    };

	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];

	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }

	        if (typeof iterable.next === "function") {
	          return iterable;
	        }

	        if (!isNaN(iterable.length)) {
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    exports.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function reset(skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function stop() {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function dispatchException(exception) {
	        if (this.done) {
	          throw exception;
	        }

	        var context = this;

	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;

	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }

	          return !!caught;
	        }

	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;

	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }

	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");

	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function abrupt(type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }

	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;

	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }

	        return this.complete(record);
	      },
	      complete: function complete(record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }

	        return ContinueSentinel;
	      },
	      finish: function finish(finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function _catch(tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;

	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }

	            return thrown;
	          }
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    }; // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.

	    return exports;
	  }( // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports );

	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

	var regenerator = runtime_1;

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

	var asyncToGenerator = _asyncToGenerator;

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

	var defineProperty = _defineProperty;

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

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

	var createClass = _createClass;

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
	    return;
	  }

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

	var iterableToArrayLimit = _iterableToArrayLimit;

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

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
	 * Helper for generating random id
	 * @returns {string}
	 */

	var randomId = function randomId() {
	  return Math.random().toString(36).substring(7);
	};
	/**
	 * Returns size of an object
	 * @param object
	 * @param breakSize
	 * @returns {number}
	 */

	var sizeOf = function sizeOf(object, breakSize) {
	  var objectList = [];
	  var stack = [object];
	  var bytes = 0;

	  while (stack.length) {
	    var value = stack.pop();

	    if (typeof value === 'boolean') {
	      bytes += 4;
	    } else if (typeof value === 'string') {
	      bytes += value.length * 2;
	    } else if (typeof value === 'number') {
	      bytes += 8;
	    } else if (_typeof_1(value) === 'object' && objectList.indexOf(value) === -1) {
	      objectList.push(value);

	      for (var i in value) {
	        stack.push(value[i]);
	      }
	    }

	    if (breakSize && bytes > breakSize) {
	      break;
	    }
	  }

	  return bytes;
	};
	/**
	 * Debug helper
	 * @param type
	 * @param args
	 */


	var loggers = {};
	var d = function d(type) {
	  if (!Config$1.get('dev') || typeof window === 'undefined') {
	    return;
	  }

	  var log = loggers[type] || console[type] || console.log;

	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  return log.apply(void 0, args);
	};
	/**
	 * Parse template helper
	 * @param string
	 * @param data
	 * @returns {Object|void|*}
	 */

	var parseTemplate = function parseTemplate(string) {
	  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  if (!string) {
	    return '[empty string]';
	  }

	  return string.replace(/{{\s*([^}]*)\s*}}/g, function (match, $1) {
	    var key = $1.trim();
	    /**
	     * Handle pluralization
	     */

	    if (key.indexOf(':') > -1) {
	      var _key$split = key.split(':'),
	          _key$split2 = slicedToArray(_key$split, 2),
	          newKey = _key$split2[0],
	          options = _key$split2[1];

	      var value = +get(data, newKey, "[".concat(newKey, "]"));
	      options = options.split('|');
	      var index = value === 0 ? 0 : value === 1 ? 1 : value > 1 ? 2 : false;

	      if (!isNaN(index)) {
	        var result = options[index];
	        return result.indexOf('_') > -1 ? result.replace(/_/g, value) : result[index];
	      }
	    }

	    return get(data, key, "[".concat(key, "]"));
	  });
	};
	/**
	 * Shows a debug panel in DOM
	 */

	var debugPanel = function debugPanel() {
	  /**
	   * Don't run on server
	   */
	  if (typeof window === 'undefined') {
	    return;
	  }

	  var search = '';
	  var panel = {
	    el: null,
	    state: {},
	    init: function init() {
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
	    colorize: function colorize(data) {
	      var location = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'console';

	      if (typeof data != 'string') {
	        var cache = [];
	        data = JSON.stringify(data, function (key, value) {
	          if (_typeof_1(value) === 'object' && value !== null) {
	            if (cache.indexOf(value) !== -1) {
	              return;
	            }

	            cache.push(value);
	          }

	          return value;
	        }, '\t');
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
	    },
	    initStyle: function initStyle() {
	      var style = document.createElement('style');
	      style.innerHTML = "\n                #debugPanel {\n                    z-index: 9203021;\n                    position: fixed;\n                    min-width: 460px;\n                    word-wrap: normal;\n                    border-radius: 4px;\n                    color: #fff;\n                    resize: both;\n                    left: ".concat(panel.state.left || '20px', ";\n                    top: ").concat(panel.state.top || '20px', ";\n                    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n                }\n                \n                #debugPanel .drag-handle {\n                    cursor: grab;\n                }\n                \n                #debugPanel .welcome-message {\n                    font-size: 12px;\n                    display: flex;\n                    align-items: center;\n                    color: #000000;\n                    font-family: Verdana;\n                    display: flex;\n                    margin-top: 43px;\n                    background: #fff;\n                    border-radius: 4px;\n                    height: 73px;\n                    overflow: hidden;\n                }\n                \n                #debugPanel .welcome-message div {\n                    color: #4a4545;\n                }\n                \n                #debugPanel .welcome-message span {\n                    color: #30bf58;\n                }\n                \n                #debugPanel .resize-handle {\n                    cursor: se-resize;\n                }\n                \n                #debugPanel button {\n                    cursor: pointer;\n                    outline: none;\n                }\n                \n                #debugPanel .inner {\n                    background: rgba(23, 22, 22, 0.92);\n                    min-height: 120px;\n                    overflow-y: auto;\n                    overflow-x: hidden;\n                    padding: 20px 20px 0 20px;\n                    ").concat(panel.state.width ? 'width: ' + panel.state.width + ';' : '', "\n                    ").concat(panel.state.width ? 'max-width: ' + panel.state.width + ';' : '', "\n                    ").concat(panel.state.height ? 'height: ' + panel.state.height + ';' : '', "\n                    max-height: 600px;\n                    border-radius: 4px;\n                    position: relative;\n                }\n                \n                #debugPanel .toggle-minimize {\n                    margin-left: auto;\n                }\n                \n                #debugPanel .controls {\n                    height: 45px;\n                    display: flex;\n                    align-items: center;\n                    background: #212021;\n                    border-radius: 4px;\n                    position: relative;\n                    overflow: hidden;\n                    margin-top: 3px;\n                }\n                \n                #debugPanel .debug-input {\n                    height: 45px;\n                    padding: 8px 14px;\n                    border: none;\n                    border-bottom-left-radius: 4px;\n                    background: #1c1a1a;\n                    box-sizing: border-box;\n                    font-size: 13px;\n                    outline: none;\n                    color: #ebebeb;\n                    flex-grow: 1;\n                    margin-right: 7px;\n                }\n                \n                #debugPanel .search {\n                    position: fixed;\n                }\n                \n                #debugPanel .search input {\n                    display: block;\n                    background: rgb(41, 40, 40);\n                    border: none;\n                    padding: 10px;\n                    color: #fff;\n                    border-bottom: 1px solid #fff;\n                }\n                \n                #debugPanel .search input:focus {\n                    outline: none;\n                }\n               \n                #debugPanel .controls button {\n                    background: #1b1a1a;\n                    color: #fff;\n                    padding: 6px 11px;\n                    font-weight: bold;\n                    height: 32px;\n                    border-radius: 4px;\n                    border: 1px solid #484848;\n                    width: 37px;\n                }\n                \n                #debugPanel .controls > div {\n                    margin-left: auto;\n                }\n                \n                #debugPanel .controls button:hover {\n                    background: #272525;\n                }\n               \n                #debugPanel .number {\n                    color:#b66bb2\n                }\n                \n                #debugPanel .key {\n                    color: #619bab;\n                }\n                \n                #debugPanel .string {\n                    color:#55c149\n                }\n                \n                #debugPanel .controls .resize-handle {\n                    margin-right: 7px;\n                }\n                \n                #debugPanel .boolean {\n                    color:#ff82a4;\n                }\n                \n                #debugPanel .null {\n                    color:#ff7477;\n                }\n                \n                #debugPanel .inner::-webkit-scrollbar {\n                  width: 5px;\n                  height: 12px;\n                }\n                \n                #debugPanel .inner::-webkit-scrollbar-track {\n                  background: rgba(0, 0, 0, 0.1);\n                }\n                \n                #debugPanel .inner::-webkit-scrollbar-thumb {\n                  background: #00a7c5;\n                  border-radius: 10px;\n                }\n                \n                #debugPanel .message {\n                    display: block;\n                    padding: 2px 0;\n                    white-space: pre-wrap;\n                    font-size: 13px;\n                    background: rgba(23, 23, 23, 0.44);\n                    margin-bottom: 7px;\n                    padding: 10px;\n                    border-radius: 4px;\n                }\n                \n                #debugPanel .message.hidden {\n                    display: none;\n                }\n                \n                #debugPanel .info {\n                    color: #00a7c5;\n                }\n                \n                #debugPanel .error {\n                    color: #ff6b6b;\n                }\n                \n                #debugPanel .warn {\n                    color: #ecc54d;\n                }\n                \n                #debugPanel .log {\n                    color: #4cff85;\n                }\n                \n                #debugPanel .object {\n                    color: #619bab;\n                    font-size: 12px;\n                    padding: 10px;\n                    display: block;\n                    background: #1b1a1a;\n                    margin: 6px 0;\n                    border-radius: 4px;\n                    max-height: 160px;\n                    overflow-y: scroll;\n                }\n                \n                #debugPanel .entity {\n                    display: block;\n                    word-break: break-word;\n                }\n                \n                #debugPanel .entity + .object {\n                    margin-top: 10px;\n                }\n            ");
	      document.head.append(style);
	    },
	    initHtml: function initHtml() {
	      panel.el = document.createElement('div');
	      panel.el.id = 'debugPanel';
	      document.body.appendChild(panel.el);
	      panel.el.innerHTML = "\n                <div class=\"inner\">\n                    <div class=\"search\">\n                        <input type=\"text\" class=\"search-input\" placeholder=\"Search\" />\n                    </div>\n                </div>\n                <div class=\"controls\">\n                    <input type=\"text\" class=\"debug-input\" placeholder=\"Execute javascript or run client actions\" />\n                    <div>\n                        <button class=\"toggle-minimize\">&#128469;</button>\n                        <button class=\"clear-panel\">&#128465;</button>\n                        <button class=\"drag-handle\">&#10021;</button>\n                        <button class=\"resize-handle\">&searr;</button>\n                    </div>\n                </div>\n            ";
	    },
	    onLoad: function onLoad() {
	      var offset, mousePosition;
	      var isDragDown = false;
	      var isResizeDown = false;
	      var dragButton = panel.el.querySelector('.drag-handle');
	      var resizeButton = panel.el.querySelector('.resize-handle');
	      var clearButton = panel.el.querySelector('.clear-panel');
	      var minimizeToggle = panel.el.querySelector('.toggle-minimize');
	      var debugInput = panel.el.querySelector('.debug-input');

	      if (panel.state.minimized) {
	        panel.el.querySelector('.inner').style.display = 'none';
	      }

	      minimizeToggle.addEventListener('click', function () {
	        panel.state.minimized = !panel.state.minimized;
	        var height = panel.el.querySelector('.inner').clientHeight;
	        panel.el.querySelector('.inner').style.display = panel.state.minimized ? 'none' : 'block';

	        if (height === 0) {
	          height = panel.el.querySelector('.inner').clientHeight;
	        }

	        var top;

	        if (panel.state.minimized) {
	          top = parseInt(panel.el.offsetTop || 20) + height;
	        } else {
	          top = parseInt(panel.el.offsetTop || 20) - height;
	        }

	        panel.el.style.top = "".concat(top, "px");
	        panel.state.top = panel.el.style.top;
	        panel.saveState();
	      });
	      var cmdIndex = 0;
	      debugInput.addEventListener('keyup', function (e) {
	        var commands = JSON.parse(localStorage.getItem('lastCommands') || '[]');

	        if (e.keyCode === 38) {
	          var cmd = commands[commands.length - cmdIndex - 1];

	          if (typeof cmd !== 'undefined') {
	            cmdIndex += 1;
	            debugInput.value = cmd;
	            debugInput.setSelectionRange(cmd.length, cmd.length);
	          }
	        }

	        if (e.keyCode === 40) {
	          var _cmd = commands[commands.length - cmdIndex + 1];

	          if (typeof _cmd !== 'undefined') {
	            cmdIndex -= 1;
	            debugInput.value = _cmd;
	            debugInput.setSelectionRange(_cmd.length, _cmd.length);
	            return;
	          }

	          debugInput.value = '';
	        }

	        if (e.keyCode === 13 && debugInput.value && debugInput.value.trim().length) {
	          try {
	            if (commands[commands.length - 1] !== debugInput.value) {
	              commands.push(debugInput.value);

	              if (commands.length > 50) {
	                commands.splice(0, 1);
	              }

	              localStorage.setItem('lastCommands', JSON.stringify(commands));
	            }

	            var res = eval(debugInput.value);
	            console.log(res);
	          } catch (error) {
	            console.error(error.stack);
	          }

	          cmdIndex = 0;
	          debugInput.value = '';
	        }
	      });
	      document.addEventListener('keyup', function (e) {
	        if (e.target.classList.contains('search-input')) {
	          search = panel.el.querySelector('.search-input').value.toLowerCase();
	          Array.from(panel.el.querySelectorAll('.message')).map(function (el) {
	            if (el.innerText.toLowerCase().indexOf(search) === -1) {
	              el.classList.add('hidden');
	            } else {
	              el.classList.remove('hidden');
	            }
	          });
	          var inner = panel.el.querySelector('.inner');
	          inner.scrollTop = inner.scrollHeight;
	        }
	      });
	      clearButton.addEventListener('click', function () {
	        var inner = panel.el.querySelector('.inner');
	        var search = panel.el.querySelector('.search');
	        inner.innerHTML = '';
	        inner.appendChild(search);
	      });
	      resizeButton.addEventListener('mousedown', function (e) {
	        isResizeDown = true;
	      });
	      document.addEventListener('mouseup', function (e) {
	        isResizeDown = false;
	      });
	      dragButton.addEventListener('mousedown', function (e) {
	        isDragDown = true;
	        offset = [panel.el.offsetLeft - e.clientX, panel.el.offsetTop - e.clientY];
	      });
	      document.addEventListener('mouseup', function () {
	        isDragDown = false;
	      });
	      document.addEventListener('mousemove', function (event) {
	        if (isDragDown) {
	          mousePosition = {
	            x: event.clientX,
	            y: event.clientY
	          };
	          var left = mousePosition.x + offset[0] + 'px';
	          var top = mousePosition.y + offset[1] + 'px';
	          panel.el.style.left = left;
	          panel.el.style.top = top;
	          panel.state.left = left;
	          panel.state.top = top;
	          panel.saveState();
	        }

	        if (isResizeDown) {
	          var width = event.clientX - panel.el.offsetLeft - 20 + 'px';
	          var height = event.clientY - panel.el.offsetTop - 55 + 'px';

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
	    saveState: function saveState() {
	      localStorage.setItem('debugPanel', JSON.stringify(panel.state));
	    },
	    onFinish: function onFinish() {
	      var inner = panel.el.querySelector('.inner');
	      var version = '3.0.5';
	      inner.innerHTML += ['<pre class="welcome-message">', "\n                 \n           `/+-                          \n         .+++/-                         \n         +++.        `.-:-.`            \n        `++-        -++++//+:`          \n         /+.      `/+++:`  `//`         \n         `//.   `-+++/.     .+/         \n          `://::/+++:`      :++         \n            `.::::-`     `-/++/         \n                         .://-` \n                ", "<div>dev: <span>".concat(Config$1.get('dev'), "</span>"), "endpoint: <span>".concat(Config$1.get('handler'), "</span>"), "version: <span>".concat(version, "</span></div>"), '', '</pre>'].join('\n');
	    },
	    hookLoggers: function hookLoggers() {
	      var hooks = ['log', 'error', 'info', 'warn'];
	      var inner = panel.el.querySelector('.inner');

	      var _loop = function _loop() {
	        var hook = _hooks[_i];
	        var consoleLogger = console[hook];

	        loggers[hook] = function () {
	          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	          }

	          var clonedArgs = [].concat(args);
	          var message = "<span class=\"message ".concat(hook, "\">");
	          var print = false;
	          var _iteratorNormalCompletion = true;
	          var _didIteratorError = false;
	          var _iteratorError = undefined;

	          try {
	            for (var _iterator = clonedArgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	              var arg = _step.value;
	              var size = sizeOf(arg, 2000);

	              if (size > 2000 || arg === undefined || arg === '' || arg === null) {
	                continue;
	              }

	              if (_typeof_1(arg) === 'object' || Array.isArray(arg)) {
	                message += '<span class="object">';
	                message += panel.colorize(arg, 'panel');
	                message += '</span>';
	                continue;
	              }

	              message += "<span class=\"entity\">".concat(arg, "</span>");
	              print = true;
	            }
	          } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	                _iterator["return"]();
	              }
	            } finally {
	              if (_didIteratorError) {
	                throw _iteratorError;
	              }
	            }
	          }

	          if (!print) {
	            return;
	          }

	          message += "</span>";
	          var e = document.createElement('span');
	          e.innerHTML = message;

	          if (search && e.innerText.toLowerCase().indexOf(search) === -1) {
	            e.querySelector('message').classList.add('hidden');
	          }

	          inner.appendChild(e);
	          inner.scrollTop = inner.scrollHeight;
	        };

	        console[hook] = function () {
	          consoleLogger.apply(void 0, arguments);
	          loggers[hook].apply(loggers, arguments);
	        };
	      };

	      for (var _i = 0, _hooks = hooks; _i < _hooks.length; _i++) {
	        _loop();
	      }

	      window.addEventListener('error', function (e) {
	        var message = e.message,
	            source = e.source,
	            lineno = e.lineno,
	            colno = e.colno,
	            error = e.error;
	        var logger = loggers.error ? loggers.error : console.error;
	        logger("Error: ".concat(message, ". ").concat(source, ":").concat(lineno, ", ").concat(error ? error.stack : ''));
	      });
	    }
	  };
	  panel.init();
	};

	var Utils = /*#__PURE__*/Object.freeze({
		__proto__: null,
		get: get,
		randomId: randomId,
		d: d,
		parseTemplate: parseTemplate,
		debugPanel: debugPanel
	});

	var Config =
	/*#__PURE__*/
	function () {
	  function Config() {
	    classCallCheck(this, Config);

	    this.storage = {};
	  }

	  createClass(Config, [{
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

	/**
	 * Client constants
	 * @type {string}
	 */
	var LOADING_START = 'loading:start';
	var LOADING_END = 'loading:end';
	var ACTION_SUCCESS = 'success';
	var ACTION_ERROR = 'error';
	var ACTION_PROGRESS = 'progress';
	var ACTION_CONFIRM = 'confirm';
	var ACTION_CONFIRM_RESOLVE = 'confirm:resolve';
	var ACTIONS_LOADED = 'actions:loaded';
	/**
	 * Socket events
	 * @type {string}
	 */

	var SOCKET_CONNECTED = 'socket:connected';
	var SOCKET_DISCONNECTED = 'socket:disconnected';
	var SOCKET_RECONNECTED = 'socket:reconnected';
	var SOCKET_AUTHENTICATED = 'socket:authenticated';

	var Constants = /*#__PURE__*/Object.freeze({
		__proto__: null,
		LOADING_START: LOADING_START,
		LOADING_END: LOADING_END,
		ACTION_SUCCESS: ACTION_SUCCESS,
		ACTION_ERROR: ACTION_ERROR,
		ACTION_PROGRESS: ACTION_PROGRESS,
		ACTION_CONFIRM: ACTION_CONFIRM,
		ACTION_CONFIRM_RESOLVE: ACTION_CONFIRM_RESOLVE,
		ACTIONS_LOADED: ACTIONS_LOADED,
		SOCKET_CONNECTED: SOCKET_CONNECTED,
		SOCKET_DISCONNECTED: SOCKET_DISCONNECTED,
		SOCKET_RECONNECTED: SOCKET_RECONNECTED,
		SOCKET_AUTHENTICATED: SOCKET_AUTHENTICATED
	});

	var Socket =
	/*#__PURE__*/
	function () {
	  function Socket(parent, sio) {
	    classCallCheck(this, Socket);

	    this.parent = parent;

	    if (!Config$1.get('socket')) {
	      return;
	    }

	    this.client = sio(Config$1.get('socket'));
	    this.setup();
	  }

	  createClass(Socket, [{
	    key: "emit",
	    value: function emit() {
	      var _this$client;

	      (_this$client = this.client).emit.apply(_this$client, arguments);
	    }
	  }, {
	    key: "on",
	    value: function on() {
	      var _this$client2;

	      (_this$client2 = this.client).on.apply(_this$client2, arguments);
	    }
	  }, {
	    key: "setup",
	    value: function setup() {
	      var _this = this;

	      var tokenHandler = Config$1.get('tokenHandler');
	      var token = tokenHandler.get('token');

	      if (token) {
	        d('info', '+ authenticating socket');
	        this.client.emit('login', token);
	      }

	      this.client.on('connect', function () {
	        d('info', '+ socket connected');

	        _this.parent.events.emit(SOCKET_CONNECTED);
	      });
	      this.client.on('reconnect', function () {
	        d('info', '+ socket reconnected');

	        _this.client.emit('login', token);

	        _this.parent.events.emit(SOCKET_RECONNECTED);
	      });
	      this.client.on('login', function () {
	        d('info', '+ socket authenticated');

	        _this.parent.events.emit(SOCKET_AUTHENTICATED);
	      });
	      this.client.on('disconnect', function () {
	        d('info', '+ socket disconnected');

	        _this.parent.events.emit(SOCKET_DISCONNECTED);
	      });
	    }
	  }, {
	    key: "logout",
	    value: function logout() {
	      d('info', '+ socket logging out');
	      this.client.emit('logout');
	    }
	  }]);

	  return Socket;
	}();

	var Actions =
	/*#__PURE__*/
	function () {
	  function Actions(parent, client) {
	    classCallCheck(this, Actions);

	    this.list = {};
	    this.parent = parent;
	    this.httpClient = client;
	    this.parent.http = this.makeHttpClient();
	    this.useDevGateway();
	  }

	  createClass(Actions, [{
	    key: "_isLogout",
	    value: function _isLogout(config) {
	      var isLogout = config.url.indexOf('logout') > -1;

	      if (!isLogout) {
	        try {
	          var _JSON$parse = JSON.parse(config.data),
	              _JSON$parse2 = slicedToArray(_JSON$parse, 2),
	              action = _JSON$parse2[0],
	              payload = _JSON$parse2[1];

	          isLogout = action === 'logout';
	        } catch (_unused) {}
	      }

	      return isLogout;
	    }
	  }, {
	    key: "useDevGateway",
	    value: function () {
	      var _useDevGateway = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee3() {
	        var _this = this;

	        var config, failed, url, _ref, data;

	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                config = this.parent.config;

	                if (!(!config.get('dev') || typeof window === 'undefined')) {
	                  _context3.next = 3;
	                  break;
	                }

	                return _context3.abrupt("return");

	              case 3:
	                /**
	                 * Reload action definitions
	                 * on server restart and log
	                 * gateway responses
	                 */
	                failed = false;
	                _context3.prev = 4;
	                url = config.get('devGateway') ? config.get('devGateway') : "".concat(config.get('handler'), "/_dev_gateway");
	                _context3.next = 8;
	                return this.parent.http.get(url);

	              case 8:
	                _ref = _context3.sent;
	                data = _ref.data;
	                d('info', '(s)', data);
	                _context3.next = 17;
	                break;

	              case 13:
	                _context3.prev = 13;
	                _context3.t0 = _context3["catch"](4);
	                failed = true;
	                setTimeout(
	                /*#__PURE__*/
	                asyncToGenerator(
	                /*#__PURE__*/
	                regenerator.mark(function _callee() {
	                  return regenerator.wrap(function _callee$(_context) {
	                    while (1) {
	                      switch (_context.prev = _context.next) {
	                        case 0:
	                          _context.next = 2;
	                          return _this.setup();

	                        case 2:
	                          client;

	                        case 3:
	                        case "end":
	                          return _context.stop();
	                      }
	                    }
	                  }, _callee);
	                })), 1000);

	              case 17:
	                setTimeout(
	                /*#__PURE__*/
	                asyncToGenerator(
	                /*#__PURE__*/
	                regenerator.mark(function _callee2() {
	                  return regenerator.wrap(function _callee2$(_context2) {
	                    while (1) {
	                      switch (_context2.prev = _context2.next) {
	                        case 0:
	                          _context2.next = 2;
	                          return _this.useDevGateway();

	                        case 2:
	                        case "end":
	                          return _context2.stop();
	                      }
	                    }
	                  }, _callee2);
	                })), failed ? 2000 : 0);

	              case 18:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[4, 13]]);
	      }));

	      function useDevGateway() {
	        return _useDevGateway.apply(this, arguments);
	      }

	      return useDevGateway;
	    }()
	  }, {
	    key: "makeHttpClient",
	    value: function makeHttpClient() {
	      var _this2 = this;

	      var tokenHandler = Config$1.get('tokenHandler');
	      var token = tokenHandler.get('token');
	      var options = {};

	      if (token) {
	        options.headers = {
	          Authorization: token
	        };
	      }

	      var client = this.httpClient.create(options);

	      var onAuthFailed =
	      /*#__PURE__*/
	      function () {
	        var _ref4 = asyncToGenerator(
	        /*#__PURE__*/
	        regenerator.mark(function _callee4() {
	          var fn;
	          return regenerator.wrap(function _callee4$(_context4) {
	            while (1) {
	              switch (_context4.prev = _context4.next) {
	                case 0:
	                  _context4.next = 2;
	                  return _this2.parent.auth.logout();

	                case 2:
	                  fn = Config$1.get('authFailed');
	                  typeof fn === 'function' && fn();

	                case 4:
	                case "end":
	                  return _context4.stop();
	              }
	            }
	          }, _callee4);
	        }));

	        return function onAuthFailed() {
	          return _ref4.apply(this, arguments);
	        };
	      }();

	      client.interceptors.response.use(function (response) {
	        return response;
	      },
	      /*#__PURE__*/
	      function () {
	        var _ref5 = asyncToGenerator(
	        /*#__PURE__*/
	        regenerator.mark(function _callee5(error) {
	          var refreshToken, _ref6, data, errors;

	          return regenerator.wrap(function _callee5$(_context5) {
	            while (1) {
	              switch (_context5.prev = _context5.next) {
	                case 0:
	                  if (!(error.response && error.response.status === 401 && !_this2._isLogout(error.config))) {
	                    _context5.next = 21;
	                    break;
	                  }

	                  refreshToken = tokenHandler.get('refresh');

	                  if (!refreshToken) {
	                    _context5.next = 19;
	                    break;
	                  }

	                  d('info', '+ token refresh');
	                  _context5.next = 6;
	                  return _this2.parent.refreshToken({
	                    token: refreshToken
	                  });

	                case 6:
	                  _ref6 = _context5.sent;
	                  data = _ref6.data;
	                  errors = _ref6.errors;

	                  if (!errors) {
	                    _context5.next = 13;
	                    break;
	                  }

	                  _context5.next = 12;
	                  return onAuthFailed();

	                case 12:
	                  return _context5.abrupt("return", error);

	                case 13:
	                  /**
	                   * Update the tokens
	                   */
	                  d('info', '(ok) refreshed token');
	                  tokenHandler.set('token', data.token);
	                  tokenHandler.set('refresh', data.refresh);
	                  _this2.parent.http.defaults.headers.Authorization = data.token;
	                  /**
	                   * Retry the request
	                   */

	                  error.config.headers.Authorization = data.token;
	                  return _context5.abrupt("return", client.request(error.config));

	                case 19:
	                  _context5.next = 21;
	                  return onAuthFailed();

	                case 21:
	                  return _context5.abrupt("return", Promise.reject(error));

	                case 22:
	                case "end":
	                  return _context5.stop();
	              }
	            }
	          }, _callee5);
	        }));

	        return function (_x) {
	          return _ref5.apply(this, arguments);
	        };
	      }());
	      return client;
	    }
	  }, {
	    key: "getAction",
	    value: function getAction(action) {
	      return this.list[action];
	    }
	  }, {
	    key: "getCache",
	    value: function getCache() {
	      return Actions.cache;
	    }
	  }, {
	    key: "setup",
	    value: function () {
	      var _setup = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee7() {
	        var _this3 = this;

	        var actions,
	            http,
	            data,
	            _ref7,
	            _actions,
	            _loop,
	            key,
	            _ret,
	            _args7 = arguments;

	        return regenerator.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                actions = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {};
	                http = this.parent.http;

	                if (Config$1.get('actions')) {
	                  _context7.next = 4;
	                  break;
	                }

	                return _context7.abrupt("return");

	              case 4:
	                data = {};

	                if (Object.keys(actions).length) {
	                  _context7.next = 21;
	                  break;
	                }

	                d('info', '+ actions');
	                _context7.prev = 7;
	                _context7.next = 10;
	                return http.get(Config$1.get('actions'));

	              case 10:
	                _ref7 = _context7.sent;
	                _actions = _ref7.data;
	                data = _actions;
	                _context7.next = 19;
	                break;

	              case 15:
	                _context7.prev = 15;
	                _context7.t0 = _context7["catch"](7);
	                d('error', '(error) failed loading actions list', _context7.t0);
	                this.parent.events.emit(ACTION_ERROR, ['init', _context7.t0]);

	              case 19:
	                _context7.next = 22;
	                break;

	              case 21:
	                data = actions;

	              case 22:
	                this.list = data;

	                _loop = function _loop(key) {
	                  if (!data.hasOwnProperty(key)) {
	                    return "continue";
	                  }

	                  if (_this3.hasOwnProperty(key)) {
	                    d('warn', "(err) (".concat(key, ") already registered"));
	                    return "continue";
	                  }

	                  _this3.parent[key] =
	                  /*#__PURE__*/
	                  function () {
	                    var _ref8 = asyncToGenerator(
	                    /*#__PURE__*/
	                    regenerator.mark(function _callee6(payload) {
	                      var options,
	                          tokenHandler,
	                          _ref9,
	                          data,
	                          errors,
	                          _args6 = arguments;

	                      return regenerator.wrap(function _callee6$(_context6) {
	                        while (1) {
	                          switch (_context6.prev = _context6.next) {
	                            case 0:
	                              options = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
	                              tokenHandler = Config$1.get('tokenHandler');
	                              _context6.next = 4;
	                              return _this3._call(key, payload, options);

	                            case 4:
	                              _ref9 = _context6.sent;
	                              data = _ref9.data;
	                              errors = _ref9.errors;

	                              if (!errors) {
	                                _context6.next = 9;
	                                break;
	                              }

	                              return _context6.abrupt("return", {
	                                data: data,
	                                errors: errors
	                              });

	                            case 9:
	                              if ((key === 'login' || key === 'setPassword') && data.token) {
	                                tokenHandler.set('token', data.token);
	                                _this3.parent.http.defaults.headers.Authorization = data.token;

	                                if (Config$1.get('refresh') && data.refresh) {
	                                  tokenHandler.set('refresh', data.refresh);
	                                }

	                                if (Config$1.get('socket')) {
	                                  _this3.parent.socket.emit('login', data.token);
	                                }
	                              }

	                              if (key === 'logout') {
	                                tokenHandler.remove('token');
	                                tokenHandler.remove('refresh');
	                                _this3.parent.http.defaults.headers.Authorization = null;

	                                if (Config$1.get('socket')) {
	                                  _this3.parent.socket.emit('logout');
	                                }
	                              }

	                              return _context6.abrupt("return", {
	                                data: data,
	                                errors: errors
	                              });

	                            case 12:
	                            case "end":
	                              return _context6.stop();
	                          }
	                        }
	                      }, _callee6);
	                    }));

	                    return function (_x2) {
	                      return _ref8.apply(this, arguments);
	                    };
	                  }();
	                };

	                _context7.t1 = regenerator.keys(data);

	              case 25:
	                if ((_context7.t2 = _context7.t1()).done) {
	                  _context7.next = 32;
	                  break;
	                }

	                key = _context7.t2.value;
	                _ret = _loop(key);

	                if (!(_ret === "continue")) {
	                  _context7.next = 30;
	                  break;
	                }

	                return _context7.abrupt("continue", 25);

	              case 30:
	                _context7.next = 25;
	                break;

	              case 32:
	                this.parent.events.emit(ACTIONS_LOADED);

	              case 33:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this, [[7, 15]]);
	      }));

	      function setup() {
	        return _setup.apply(this, arguments);
	      }

	      return setup;
	    }()
	  }, {
	    key: "_configAction",
	    value: function _configAction() {
	      var _this4 = this;

	      var withProgress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	      var config = {};

	      if (withProgress) {
	        config.onUploadProgress = function (e) {
	          var percent = Math.floor(e.loaded * 100 / e.total);

	          _this4.parent.events.emit(ACTION_PROGRESS, [name, percent]);
	        };

	        config.onDownloadProgress = function (e) {
	          var percent = Math.floor(e.loaded * 100 / e.total);

	          _this4.parent.events.emit(ACTION_PROGRESS, [name, percent]);
	        };
	      }

	      return config;
	    }
	  }, {
	    key: "_validateAction",
	    value: function () {
	      var _validateAction2 = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee8(action, payload) {
	        var result, errors;
	        return regenerator.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                result = false;

	                if (!(this.list[action] && Object.keys(this.list[action]).length)) {
	                  _context8.next = 6;
	                  break;
	                }

	                _context8.next = 4;
	                return this.parent.validator.validate(payload, this.list[action]);

	              case 4:
	                errors = _context8.sent;

	                if (Object.keys(errors).length) {
	                  result = errors;
	                  d('info', "(err) (".concat(action, ")(local validation)"), errors);
	                }

	              case 6:
	                return _context8.abrupt("return", result);

	              case 7:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));

	      function _validateAction(_x3, _x4) {
	        return _validateAction2.apply(this, arguments);
	      }

	      return _validateAction;
	    }()
	  }, {
	    key: "batch",

	    /**
	     * Calls a batched request
	     */
	    value: function () {
	      var _batch = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee9() {
	        var actions,
	            options,
	            result,
	            names,
	            start,
	            form,
	            action,
	            payload,
	            errors,
	            _ref10,
	            actionResults,
	            _iteratorNormalCompletion,
	            _didIteratorError,
	            _iteratorError,
	            _iterator,
	            _step,
	            actionResult,
	            _action,
	            _data,
	            _errors,
	            _args9 = arguments;

	        return regenerator.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                actions = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {};
	                options = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : {
	                  validate: true
	                };
	                result = {
	                  errors: false,
	                  data: false
	                };
	                names = Object.keys(actions).join(', ');
	                start = +new Date();
	                d('info', "+ running (".concat(names, ")"));
	                form = [];
	                _context9.t0 = regenerator.keys(actions);

	              case 8:
	                if ((_context9.t1 = _context9.t0()).done) {
	                  _context9.next = 22;
	                  break;
	                }

	                action = _context9.t1.value;
	                payload = actions[action];

	                if (!options.validate) {
	                  _context9.next = 19;
	                  break;
	                }

	                _context9.next = 14;
	                return this._validateAction(action, payload);

	              case 14:
	                errors = _context9.sent;

	                if (!errors) {
	                  _context9.next = 19;
	                  break;
	                }

	                if (!result.errors) {
	                  result.errors = {};
	                }

	                result.errors[action] = errors;
	                return _context9.abrupt("continue", 8);

	              case 19:
	                form.push([action, payload]);
	                _context9.next = 8;
	                break;

	              case 22:
	                if (form.length) {
	                  _context9.next = 24;
	                  break;
	                }

	                return _context9.abrupt("return", this.finishTransaction(options, null, result, actions, start));

	              case 24:
	                _context9.prev = 24;
	                _context9.next = 27;
	                return this.parent.http.post(Config$1.get('handler'), form, this._configAction(options.progress, names));

	              case 27:
	                _ref10 = _context9.sent;
	                actionResults = _ref10.data;

	                if (Array.isArray(actionResults)) {
	                  _context9.next = 33;
	                  break;
	                }

	                result.errors = {
	                  other: {
	                    message: ['Unexpected API response']
	                  }
	                };
	                _context9.next = 65;
	                break;

	              case 33:
	                _iteratorNormalCompletion = true;
	                _didIteratorError = false;
	                _iteratorError = undefined;
	                _context9.prev = 36;
	                _iterator = actionResults[Symbol.iterator]();

	              case 38:
	                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	                  _context9.next = 51;
	                  break;
	                }

	                actionResult = _step.value;
	                _action = Object.keys(actionResult)[0];
	                _data = actionResult[_action];

	                if (!actionResult[_action].errors) {
	                  _context9.next = 46;
	                  break;
	                }

	                if (!result.errors) {
	                  result.errors = {};
	                }

	                result.errors[_action] = actionResult[_action].errors;
	                return _context9.abrupt("continue", 48);

	              case 46:
	                if (!result.data) {
	                  result.data = {};
	                }

	                result.data[_action] = _data;

	              case 48:
	                _iteratorNormalCompletion = true;
	                _context9.next = 38;
	                break;

	              case 51:
	                _context9.next = 57;
	                break;

	              case 53:
	                _context9.prev = 53;
	                _context9.t2 = _context9["catch"](36);
	                _didIteratorError = true;
	                _iteratorError = _context9.t2;

	              case 57:
	                _context9.prev = 57;
	                _context9.prev = 58;

	                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	                  _iterator["return"]();
	                }

	              case 60:
	                _context9.prev = 60;

	                if (!_didIteratorError) {
	                  _context9.next = 63;
	                  break;
	                }

	                throw _iteratorError;

	              case 63:
	                return _context9.finish(60);

	              case 64:
	                return _context9.finish(57);

	              case 65:
	                _context9.next = 71;
	                break;

	              case 67:
	                _context9.prev = 67;
	                _context9.t3 = _context9["catch"](24);
	                _errors = get(_context9.t3, 'response.data.errors', false);
	                result.errors = {
	                  other: _errors ? _errors : {
	                    message: [_context9.t3.response]
	                  }
	                };

	              case 71:
	                return _context9.abrupt("return", this.finishTransaction(options, null, result, actions, start));

	              case 72:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this, [[24, 67], [36, 53, 57, 65], [58,, 60, 64]]);
	      }));

	      function batch() {
	        return _batch.apply(this, arguments);
	      }

	      return batch;
	    }()
	  }, {
	    key: "finishTransaction",
	    value: function finishTransaction(options, action, result, payload, start) {
	      if (options.loading) {
	        this.parent.events.emit(LOADING_END, [action, payload]);
	      }

	      if (result.errors) {
	        if (action === null) {
	          for (var key in Object.keys(result.errors)) {
	            this.parent.events.emit(ACTION_ERROR, [key, result.errors[key], payload[key]]);
	          }
	        } else {
	          this.parent.events.emit(ACTION_ERROR, [action, result.errors, payload]);
	        }
	      } else {
	        if (action === null) {
	          for (var _key in Object.keys(result.data)) {
	            this.parent.events.emit(ACTION_SUCCESS, [_key, result.data[_key], payload[_key]]);
	          }
	        } else {
	          this.parent.events.emit(ACTION_SUCCESS, [action, result.data, payload]);
	        }
	      }

	      var end = +new Date();
	      d(!!result.errors ? 'error' : 'info', "(".concat(!!result.errors ? 'fail' : 'ok', ") (").concat(action, ") in (").concat(end - start, " ms)"), result);
	      return result;
	    }
	    /**
	     * Confirm event prevents action
	     * from being called unless resolved
	     * @param action
	     * @param payload
	     * @returns {Promise<any>}
	     */

	  }, {
	    key: "confirm",
	    value: function confirm(action, payload) {
	      var _this5 = this;

	      return new Promise(function (resolve) {
	        var id = randomId();

	        _this5.parent.events.once(ACTION_CONFIRM_RESOLVE, function (_ref11) {
	          var _ref12 = slicedToArray(_ref11, 2),
	              entry = _ref12[0],
	              result = _ref12[1];

	          if (id === entry) {
	            resolve(result);
	          }
	        });

	        _this5.parent.events.emit(ACTION_CONFIRM, [id, action, payload]);
	      });
	    }
	  }, {
	    key: "_call",

	    /**
	     * Call an action
	     * @returns
	     * @private
	     */
	    value: function () {
	      var _call2 = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee10(action) {
	        var payload,
	            options,
	            result,
	            passed,
	            start,
	            errors,
	            method,
	            path,
	            _ref13,
	            _data2,
	            debug,
	            _errors2,
	            commands,
	            cmd,
	            _args10 = arguments;

	        return regenerator.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                payload = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : {};
	                options = _args10.length > 2 && _args10[2] !== undefined ? _args10[2] : {
	                  validate: true,
	                  cache: false,
	                  shouldInvalidate: false,
	                  confirm: false
	                };
	                result = {
	                  errors: false,
	                  data: false
	                };

	                if (!options.confirm) {
	                  _context10.next = 9;
	                  break;
	                }

	                _context10.next = 6;
	                return this.confirm(action, payload);

	              case 6:
	                passed = _context10.sent;

	                if (passed) {
	                  _context10.next = 9;
	                  break;
	                }

	                return _context10.abrupt("return", {
	                  errors: 'NOT_CONFIRMED',
	                  data: false
	                });

	              case 9:
	                if (options.loading) {
	                  this.parent.events.emit(LOADING_START, [action, payload]);
	                }

	                start = +new Date();
	                d('info', "+ running (".concat(action, "), payload:"), payload);
	                /**
	                 * If in cache, return cached value
	                 */

	                if (typeof options.shouldInvalidate === 'function' && options.shouldInvalidate(Actions.cache[action], Actions.cache[action])) {
	                  delete Actions.cache[action];
	                }

	                if (!(Actions.cache[action] && Actions.cache[action].data)) {
	                  _context10.next = 17;
	                  break;
	                }

	                d('info', "+ cache (".concat(action, ") is cached"));
	                result = Actions.cache[action];
	                return _context10.abrupt("return", this.finishTransaction(options, action, result, payload, start));

	              case 17:
	                if (!options.validate) {
	                  _context10.next = 24;
	                  break;
	                }

	                _context10.next = 20;
	                return this._validateAction(action, payload);

	              case 20:
	                errors = _context10.sent;

	                if (!errors) {
	                  _context10.next = 24;
	                  break;
	                }

	                result.errors = errors;
	                return _context10.abrupt("return", this.finishTransaction(options, action, result, payload, start));

	              case 24:
	                _context10.prev = 24;
	                method = 'post';
	                path = Config$1.get('handler');

	                if (Array.isArray(action)) {
	                  method = action[0];
	                  path = action[1];
	                }

	                _context10.next = 30;
	                return this.parent.http[method](path, typeof window !== 'undefined' && payload instanceof FormData ? payload : [action, payload], this._configAction(options.progress, action));

	              case 30:
	                _ref13 = _context10.sent;
	                _data2 = _ref13.data;

	                if (_data2 && _data2.errors) {
	                  result.errors = _data2.errors;
	                } else {
	                  result.data = _data2;

	                  if (options.cache) {
	                    d('info', "+ cache Adding data to cache for (".concat(action, ")"));
	                    Actions.cache[action] = result;
	                    Actions.cache[action].createdAt = new Date();
	                  }
	                }

	                _context10.next = 41;
	                break;

	              case 35:
	                _context10.prev = 35;
	                _context10.t0 = _context10["catch"](24);
	                debug = get(_context10.t0, 'response.data.debug', false);
	                _errors2 = get(_context10.t0, 'response.data.errors', false);
	                result.errors = _errors2 ? _errors2 : {
	                  message: [_context10.t0.response ? _context10.t0.response : _context10.t0]
	                };

	                if (debug) {
	                  result.debug = debug;
	                }

	              case 41:
	                if (this.parent.config.get('debug') && typeof window !== 'undefined') {
	                  commands = JSON.parse(localStorage.getItem('commands') || '[]');
	                  cmd = "client.call('".concat(action, "', ").concat(JSON.stringify(payload), ", ").concat(JSON.stringify(options), ");");

	                  if (commands[commands.length - 1] !== cmd) {
	                    commands.push(cmd);

	                    if (commands.length > 50) {
	                      commands.splice(0, 1);
	                    }

	                    localStorage.setItem('lastCommands', JSON.stringify(commands));
	                  }
	                }

	                action = Array.isArray(action) ? action[1] : action;
	                return _context10.abrupt("return", this.finishTransaction(options, action, result, payload, start));

	              case 44:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this, [[24, 35]]);
	      }));

	      function _call(_x5) {
	        return _call2.apply(this, arguments);
	      }

	      return _call;
	    }()
	  }]);

	  return Actions;
	}();

	Actions.cache = {};
	Actions.confirmQueue = {};

	var Auth =
	/*#__PURE__*/
	function () {
	  function Auth(parent) {
	    classCallCheck(this, Auth);

	    this.parent = parent;
	    this.user = false;
	  }

	  createClass(Auth, [{
	    key: "login",
	    value: function () {
	      var _login = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee(payload) {
	        var _ref, data, errors, user;

	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this.parent.login(payload);

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
	      var _getUser = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee2() {
	        var _ref2, data, errors;

	        return regenerator.wrap(function _callee2$(_context2) {
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
	      var _logout = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee3() {
	        var tokenHandler, _ref3, errors, data, cache;

	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                d('info', '+ running (logout)');
	                tokenHandler = Config$1.get('tokenHandler');

	                if (tokenHandler.get('token')) {
	                  _context3.next = 4;
	                  break;
	                }

	                return _context3.abrupt("return", {
	                  data: {
	                    success: true
	                  },
	                  errors: false
	                });

	              case 4:
	                _context3.next = 6;
	                return this.parent.logout();

	              case 6:
	                _ref3 = _context3.sent;
	                errors = _ref3.errors;
	                data = _ref3.data;
	                this.user = false;
	                cache = this.parent.getCache();

	                if (cache.getUser) {
	                  delete cache.getUser;
	                }

	                tokenHandler.remove('token');
	                tokenHandler.remove('refresh');
	                d('info', '(ok) logout');
	                return _context3.abrupt("return", {
	                  errors: errors,
	                  data: data
	                });

	              case 16:
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
	    classCallCheck(this, Event);

	    this.events = {};
	  }

	  createClass(Event, [{
	    key: "on",
	    value: function on(event, listener) {
	      var _this = this;

	      if (_typeof_1(this.events[event]) !== 'object') {
	        this.events[event] = [];
	      }

	      this.events[event].push(listener);
	      d('info', "+ event (".concat(event, ")"));
	      return function () {
	        return _this.removeListener(event, listener);
	      };
	    }
	  }, {
	    key: "multi",
	    value: function multi(events) {
	      var listeners = [];

	      for (var k in events) {
	        listeners.push(this.on(k, events[k]));
	      }

	      return {
	        unbind: function unbind() {
	          listeners.map(function (remove) {
	            return remove();
	          });
	        }
	      };
	    }
	  }, {
	    key: "removeListener",
	    value: function removeListener(event, listener) {
	      d('info', "- event (".concat(event, ")"));

	      if (_typeof_1(this.events[event]) !== 'object') {
	        return;
	      }

	      if (!listener) {
	        this.events[event] = [];
	        return;
	      }

	      var i = this.events[event].indexOf(listener);

	      if (i > -1) {
	        this.events[event].splice(i, 1);
	      }
	    }
	  }, {
	    key: "emit",
	    value: function emit(event) {
	      var _this2 = this;

	      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      if (_typeof_1(this.events[event]) === 'object') {
	        this.events[event].forEach(function (listener) {
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

	    if (typeof value !== 'undefined' && !re.test(value)) {
	      return 'validation.email';
	    }
	  },
	  required: function required(value) {
	    if (typeof value === 'undefined') {
	      return 'validation.required';
	    }
	  },
	  string: function string(value) {
	    if (typeof value !== 'undefined' && typeof value !== 'string') {
	      return 'validation.string';
	    }
	  },
	  min: function min(value, field, opts) {
	    if (typeof value === 'undefined') {
	      return;
	    }

	    if (typeof value === 'string' && value.length < Number(opts[0])) {
	      return 'validation.min';
	    }

	    if (typeof value === 'number' && value < Number(opts[0])) {
	      return 'validation.min';
	    }
	  },
	  max: function max(value, field, opts) {
	    if (typeof value === 'undefined') {
	      return;
	    }

	    if (typeof value === 'string' && value.length > Number(opts[0])) {
	      return 'validation.max';
	    }

	    if (typeof value === 'number' && value > Number(opts[0])) {
	      return 'validation.max';
	    }
	  },
	  number: function number(value) {
	    if (typeof value !== 'undefined' && typeof value !== 'number') {
	      return 'validation.number';
	    }
	  },
	  when: function when(value, key, options, allInput) {
	    var _options = slicedToArray(options, 2),
	        required = _options[0],
	        field = _options[1];

	    var shouldEqual = field[0] !== '!';

	    if (shouldEqual && allInput[required] && allInput[required] == field) {
	      return true;
	    }

	    if (!shouldEqual && allInput[required] && allInput[required] != field.substring(1, field.length)) {
	      return true;
	    }
	  },
	  sameAs: function sameAs(value, field, opts, allInput) {
	    if (value !== allInput[opts[0]]) {
	      return 'validation.sameAs';
	    }
	  },
	  date: function date(value) {
	    var isValid = new Date(value) !== "Invalid Date" && !isNaN(new Date(value));

	    if (typeof value !== 'undefined' && !isValid) {
	      return 'validation.date';
	    }
	  }
	};

	var Validator =
	/*#__PURE__*/
	function () {
	  function Validator(parent) {
	    classCallCheck(this, Validator);

	    this.parent = parent;
	  }

	  createClass(Validator, [{
	    key: "registerRule",
	    value: function registerRule(key, handler) {
	      allRules[key] = handler;
	    }
	  }, {
	    key: "validateField",
	    value: function () {
	      var _validateField = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee(inputValue, inputKey, rules, allInput) {
	        var _this = this;

	        var split, shouldSkip, validations, translate, errors;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                split = rules.split('|');
	                shouldSkip = false;
	                validations = split.map(function (key) {
	                  var _key$split = key.split(':'),
	                      _key$split2 = slicedToArray(_key$split, 2),
	                      ruleName = _key$split2[0],
	                      _key$split2$ = _key$split2[1],
	                      opts = _key$split2$ === void 0 ? '' : _key$split2$;

	                  var options = opts.split(',');

	                  if (ruleName === 'when') {
	                    shouldSkip = !allRules.when(inputValue, inputKey, options, allInput);
	                    return;
	                  }

	                  if (!allRules[ruleName]) {
	                    return;
	                  }

	                  var message = allRules[ruleName](inputValue, inputKey, options, allInput);

	                  if (!message) {
	                    return;
	                  }

	                  return {
	                    message: message,
	                    options: options
	                  };
	                });

	                if (!shouldSkip) {
	                  _context.next = 5;
	                  break;
	                }

	                return _context.abrupt("return", []);

	              case 5:
	                translate = function translate(x) {
	                  return Config$1.get('i18n') ? _this.parent.i18n.t(x.message, {
	                    field: inputKey,
	                    value: inputValue,
	                    options: x.options
	                  }) : x.message;
	                };

	                _context.next = 8;
	                return Promise.all(validations);

	              case 8:
	                errors = _context.sent;
	                return _context.abrupt("return", errors.filter(function (error) {
	                  return error !== undefined;
	                }).map(translate));

	              case 10:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function validateField(_x, _x2, _x3, _x4) {
	        return _validateField.apply(this, arguments);
	      }

	      return validateField;
	    }()
	  }, {
	    key: "validate",
	    value: function () {
	      var _validate = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee2(values, rules) {
	        var valid, errors, key, errorsList;
	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                valid = true;
	                errors = {};
	                _context2.t0 = regenerator.keys(rules);

	              case 3:
	                if ((_context2.t1 = _context2.t0()).done) {
	                  _context2.next = 13;
	                  break;
	                }

	                key = _context2.t1.value;

	                if (rules.hasOwnProperty(key)) {
	                  _context2.next = 7;
	                  break;
	                }

	                return _context2.abrupt("continue", 3);

	              case 7:
	                _context2.next = 9;
	                return this.validateField(values[key], key, rules[key], values);

	              case 9:
	                errorsList = _context2.sent;

	                if (errorsList.length) {
	                  errors[key] = errorsList;
	                  valid = false;
	                }

	                _context2.next = 3;
	                break;

	              case 13:
	                return _context2.abrupt("return", valid ? valid : errors);

	              case 14:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function validate(_x5, _x6) {
	        return _validate.apply(this, arguments);
	      }

	      return validate;
	    }()
	  }]);

	  return Validator;
	}();

	var I18n =
	/*#__PURE__*/
	function () {
	  function I18n(parent) {
	    classCallCheck(this, I18n);

	    this.parent = parent;
	    this.translations = {};
	  }

	  createClass(I18n, [{
	    key: "setup",
	    value: function () {
	      var _setup = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee() {
	        var _Config$get, store, load, translations;

	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (Config$1.get('i18n')) {
	                  _context.next = 2;
	                  break;
	                }

	                return _context.abrupt("return");

	              case 2:
	                _Config$get = Config$1.get('i18n'), store = _Config$get.store, load = _Config$get.load;

	                if (!(!store || typeof window === 'undefined')) {
	                  _context.next = 5;
	                  break;
	                }

	                return _context.abrupt("return");

	              case 5:
	                translations = localStorage.getItem('i18n');

	                if (!(!translations && load)) {
	                  _context.next = 10;
	                  break;
	                }

	                _context.next = 9;
	                return this.getTranslations(load);

	              case 9:
	                return _context.abrupt("return");

	              case 10:
	                this.translations = JSON.parse(translations);

	              case 11:
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
	  }, {
	    key: "t",
	    value: function t(key, params) {
	      return parseTemplate(get(this.translations, key, ''), params);
	    }
	    /**
	     * Loads translations from the api
	     * @param list
	     * @param locale
	     * @returns {Promise<void>}
	     */

	  }, {
	    key: "getTranslations",
	    value: function () {
	      var _getTranslations = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee2() {
	        var list,
	            locale,
	            _Config$get2,
	            store,
	            _ref,
	            data,
	            errors,
	            _args2 = arguments;

	        return regenerator.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                list = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : [];
	                locale = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 'en';
	                _Config$get2 = Config$1.get('i18n'), store = _Config$get2.store;
	                _context2.next = 5;
	                return this.parent.call('getTranslations', {
	                  list: list,
	                  locale: locale
	                });

	              case 5:
	                _ref = _context2.sent;
	                data = _ref.data;
	                errors = _ref.errors;

	                if (!errors) {
	                  _context2.next = 10;
	                  break;
	                }

	                return _context2.abrupt("return");

	              case 10:
	                this.translations = data;

	                if (store && typeof window !== 'undefined') {
	                  localStorage.setItem('i18n', JSON.stringify(this.translations));
	                  d('info', '(ok) loaded translations');
	                }

	              case 12:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function getTranslations() {
	        return _getTranslations.apply(this, arguments);
	      }

	      return getTranslations;
	    }()
	    /**
	     * Updates localStorage locales and calls the setLocale action
	     * @param locale
	     * @returns {Promise<void>}
	     */

	  }, {
	    key: "setLocale",
	    value: function () {
	      var _setLocale = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee3() {
	        var locale,
	            _ref2,
	            data,
	            errors,
	            _Config$get3,
	            load,
	            _args3 = arguments;

	        return regenerator.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                locale = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : 'en';
	                _context3.next = 3;
	                return this.parent.call('setLocale', {
	                  locale: locale
	                });

	              case 3:
	                _ref2 = _context3.sent;
	                data = _ref2.data;
	                errors = _ref2.errors;

	                if (!errors) {
	                  _context3.next = 8;
	                  break;
	                }

	                return _context3.abrupt("return", Promise.reject(errors));

	              case 8:
	                _Config$get3 = Config$1.get('i18n'), load = _Config$get3.load;
	                _context3.next = 11;
	                return this.getTranslations(load, locale);

	              case 11:
	                return _context3.abrupt("return", Promise.resolve());

	              case 12:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function setLocale() {
	        return _setLocale.apply(this, arguments);
	      }

	      return setLocale;
	    }()
	  }]);

	  return I18n;
	}();

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
	/**
	 * Default options
	 * @type {{}}
	 */

	var defaults = {
	  dev: false,
	  socket: false,
	  actions: '/',
	  handler: '/',
	  refresh: true,
	  authFailed: false,
	  sio: null,
	  axios: null,
	  i18n: false,
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
	/**
	 * Client package
	 */

	var Serpent =
	/*#__PURE__*/
	function () {
	  function Serpent() {
	    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Serpent);

	    this.opts = _objectSpread({}, defaults, {}, opts);
	    Config$1.store(this.opts);
	    this.onReady = false;

	    if (this.opts.dev && typeof window !== 'undefined') {
	      window.client = this;
	      debugPanel();
	    }
	  }
	  /**
	   * Setup the client
	   * @returns {Promise<void>}
	   */


	  createClass(Serpent, [{
	    key: "setup",
	    value: function () {
	      var _setup = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee() {
	        var actions,
	            _args = arguments;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                actions = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
	                this.events = new Event();
	                this.config = Config$1;
	                this.auth = new Auth(this);
	                this.actions = new Actions(this, Config$1.get('axios'));
	                this.socket = new Socket(this, Config$1.get('sio'));
	                this.i18n = new I18n(this);
	                this.validator = new Validator(this);
	                this.utils = Utils;
	                this.config = Config$1;
	                _context.next = 12;
	                return this.actions.setup(actions);

	              case 12:
	                _context.next = 14;
	                return this.i18n.setup();

	              case 14:
	                typeof this.onReady === 'function' && this.onReady();

	              case 15:
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
	      return this.actions._call(action, payload);
	    }
	  }]);

	  return Serpent;
	}();
	Serpent.Constants = Constants;

	return Serpent;

})));
