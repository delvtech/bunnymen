"use strict";

var _excluded = ["completion"];
var _Gaiman;
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
/*    ______      _
 *   / ____/___ _(_)___ ___  ____ _____
 *  / / __/ __ `/ / __ `__ \/ __ `/ __ \
 * / /_/ / /_/ / / / / / / / /_/ / / / /
 * \____/\__,_/_/_/ /_/ /_/\__,_/_/ /_/
 *
 * Code generated by Gaiman version 1.0.0-beta.3
 * https://gaiman.js.org
 */
function parse_cookies(cookies) {
  var result = {};
  cookies.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    var name = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair.splice(1).join('='));
    result[name] = value;
  });
  return result;
}
function is_function(obj) {
  return typeof obj === 'function';
}
function is_promise(obj) {
  return obj && is_function(obj.then);
}
function is_node() {
  return typeof process !== 'undefined' && process.release.name === 'node';
}

// based on https://stackoverflow.com/a/46282334/387194
function extend(object, prototype) {
  var descriptors = Object.getOwnPropertyDescriptors(object);
  for (var prop in descriptors) {
    Object.defineProperty(prototype, prop, descriptors[prop]);
  }
}
var loops = {};
var Gaiman = (_Gaiman = {
  _get_time: function _get_time() {
    return +new Date();
  },
  should_break_loop: function should_break_loop(id) {
    if (!loops[id]) {
      loops[id] = {
        start: this._get_time(),
        count: 1
      };
      return false;
    } else {
      var now = this._get_time();
      var start = loops[id].start;
      var count = ++loops[id].count;
      if (count > this._config.loop_threshold) {
        var stop = now - start > this._config.loop_timeout;
        if (stop) {
          window.parent.postMessage({
            message: 'Infinite Loop detected!',
            colno: null,
            lineno: null
          });
        }
        return stop;
      }
      return false;
    }
  },
  exit_loop: function exit_loop(id) {
    delete loops[id];
  },
  type: function type(obj) {
    if (obj === 'null') {
      return 'null';
    } else if (Number.isNaN(obj)) {
      return 'nan';
    } else if (obj instanceof Array) {
      return 'array';
    } else {
      var type = _typeof(obj);
      if (type === 'object') {
        // https://tinyurl.com/fixing-typeof
        return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      }
      return type;
    }
  },
  parse: function parse(input) {
    return $.terminal.parse_arguments(input);
  },
  parse_extra: function parse_extra(input) {
    return $.terminal.split_arguments(input);
  },
  set_cookie: function set_cookie(name, value) {
    document.cookie = "".concat(name, "=").concat(value);
    cookie[name] = value;
  },
  post: function post(url) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return $.post(url, data);
  },
  post_extra: function post_extra(url) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return $.post(url, data, $.noop, "text");
  },
  get: function get(url, data) {
    if (data) {
      return $.get(url, data);
    }
    return $.get(url);
  },
  get_extra: function get_extra(url, data) {
    if (data) {
      return $.get(url, data, $.noop, "text");
    }
    return $.get(url, $.noop, "text");
  },
  load: function load(url) {
    return $.getScript(url);
  }
}, _defineProperty(_Gaiman, 'async', function async(fn) {
  setTimeout(fn, 0);
}), _defineProperty(_Gaiman, "rpc", function rpc(url) {
  return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", new Proxy({}, {
            get: function get(target, name) {
              if (name in target) {
                return target[name];
              }
              if (name === 'then') {
                return undefined;
              }
              return function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }
                return $.rpc(url, name, args);
              };
            },
            set: function set() {
              throw new Error("You can't set properties on rpc object");
            }
          }));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }))();
}), _Gaiman);
function to_string(object) {
  if (object instanceof Array) {
    object = object.map(to_string);
  } else {
    var type = _typeof(object);
    if (type === 'number') {
      object = String(object);
    } else if (type !== 'string') {
      if (object) {
        object = JSON.stringify(object, null, 2);
      } else {
        object = String(object);
      }
    }
  }
  return object;
}
var WebAdapter = /*#__PURE__*/function () {
  function WebAdapter() {
    var _window$parent,
      _this = this;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, WebAdapter);
    this._config = $.extend({
      newline: true,
      loop_threshold: 500,
      loop_timeout: 200
    }, config);
    var root = $('#term');
    var options = root.css('--options');
    if (typeof options === 'undefined') {
      options = {};
    } else {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.warn('Gaiman: Invalid --option CSS variable');
        options = {};
      }
    }
    var playground = (_window$parent = window.parent) === null || _window$parent === void 0 ? void 0 : _window$parent.__GAIMAN_PLAYGROUND__;
    if (playground) {
      options.enabled = false;
    }
    this._term = root.terminal($.noop, $.extend({
      greetings: false,
      exit: false,
      keydown: function keydown() {
        if (_this._animation) {
          return false;
        }
      },
      exceptionHandler: function exceptionHandler(e) {
        if (is_iframe) {
          window.parent.postMessage({
            message: 'Internal: ' + e.message,
            colno: null,
            lineno: null
          });
        } else {
          throw e;
        }
      }
    }, options));
  }
  _createClass(WebAdapter, [{
    key: "config",
    value: function config(name, value) {
      if (typeof name === 'string') {
        this._config[name] = value;
      } else {
        var completion = name.completion,
          rest = _objectWithoutProperties(name, _excluded);
        this._term.settings().completion = completion;
        $.extend(rest, name);
      }
    }
  }, {
    key: "store",
    value: function store(name) {
      try {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        if (args.length === 0) {
          return JSON.parse(localStorage.getItem(name));
        } else {
          var value = args[0];
          localStorage.setItem(name, JSON.stringify(value));
        }
      } catch (e) {
        // ignore errors that may happen in Incognito mode
      }
    }
  }, {
    key: "sleep",
    value: function sleep(timeout) {
      var _this2 = this;
      var visible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this._term.pause(visible);
      return new Promise(function (resolve) {
        setTimeout(function () {
          _this2._term.resume();
          resolve();
        }, Number(timeout));
      });
    }
  }, {
    key: "sleep_extra",
    value: function sleep_extra(timeout) {
      return this.sleep(timeout, true);
    }
  }, {
    key: "mask",
    value: function mask(char) {
      if (arguments.length === 0) {
        return this._term.cmd().mask();
      }
      this._term.set_mask(char);
    }
  }, {
    key: "error",
    value: function error(e) {
      var message;
      if (e.statusText) {
        message = "Failed to fetch: ".concat(e.url, "\n").concat(e.statusText);
      } else {
        message = e.message || e;
      }
      this._term.error(message);
    }
  }, {
    key: "echo",
    value: function echo() {
      var arg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      if (typeof arg !== 'function') {
        arg = to_string(arg);
      }
      this._term.echo(arg, {
        newline: this._config.newline
      });
    }
  }, {
    key: "echo_extra",
    value: function echo_extra(string, delay) {
      return this._term.echo(string, {
        typing: true,
        delay: delay
      });
    }
  }, {
    key: "enter",
    value: function enter(string) {
      return this._term.enter(string);
    }
  }, {
    key: "enter_extra",
    value: function enter_extra(string, delay) {
      return this._term.enter(string, {
        typing: true,
        delay: delay
      });
    }
  }, {
    key: "ask",
    value: function ask(message) {
      var _this3 = this;
      var validator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return true;
      };
      return new Promise(function (resolve) {
        _this3._term.push(function (result) {
          return Promise.resolve().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(typeof validator !== 'function')) {
                    _context2.next = 2;
                    break;
                  }
                  throw new Error('ask validator needs to be a function');
                case 2:
                  _context2.next = 4;
                  return validator(result);
                case 4:
                  if (!_context2.sent) {
                    _context2.next = 7;
                    break;
                  }
                  _this3._term.pop();
                  resolve(result);
                case 7:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })));
        }, {
          prompt: message
        });
      });
    }
  }, {
    key: "ask_extra",
    value: function ask_extra(message, delay) {
      var _this4 = this;
      var validator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
        return true;
      };
      return new Promise(function (resolve) {
        var prompt = _this4._term.get_prompt();
        _this4._term.push(function (result) {
          return Promise.resolve().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(typeof validator !== 'function')) {
                    _context3.next = 2;
                    break;
                  }
                  throw new Error('ask* validator needs to be a function');
                case 2:
                  _context3.next = 4;
                  return validator(result);
                case 4:
                  if (!_context3.sent) {
                    _context3.next = 9;
                    break;
                  }
                  _this4._term.pop().set_prompt(prompt);
                  resolve(result);
                  _context3.next = 10;
                  break;
                case 9:
                  _this4._term.set_prompt(message, {
                    typing: true,
                    delay: delay
                  });
                case 10:
                case "end":
                  return _context3.stop();
              }
            }, _callee3);
          })));
        }).set_prompt(message, {
          typing: true,
          delay: delay
        });
      });
    }
  }, {
    key: "update",
    value: function update(index, string) {
      this._term.update(index, string);
    }
  }, {
    key: "prompt",
    value: function prompt(string) {
      this._term.set_prompt(string);
    }
  }, {
    key: "prompt_extra",
    value: function prompt_extra(string, delay) {
      return this._term.set_prompt(string, {
        typing: true,
        delay: delay
      });
    }
  }, {
    key: "input",
    value: function input(string) {
      return this._term.exec(string);
    }
  }, {
    key: "input_extra",
    value: function input_extra(string, delay) {
      return this._term.exec(string, {
        typing: true,
        delay: delay
      });
    }
  }, {
    key: "exec",
    value: function exec(command) {
      return this._term.exec(command);
    }
  }, {
    key: "exec_extra",
    value: function exec_extra(command, delay) {
      return this._term.exec(command, {
        typing: true,
        delay: delay
      });
    }
  }, {
    key: "animate",
    value: function () {
      var _animate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(fn) {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              this._animation = true;
              _context4.next = 3;
              return fn();
            case 3:
              this._animation = false;
            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function animate(_x) {
        return _animate.apply(this, arguments);
      }
      return animate;
    }()
  }, {
    key: "clear",
    value: function clear() {
      this._term.clear();
    }
  }]);
  return WebAdapter;
}();
$.ajaxSetup({
  beforeSend: function beforeSend(jqXHR, settings) {
    jqXHR.url = settings.url;
  }
});
extend(Gaiman, WebAdapter.prototype);
var GaimanArray = /*#__PURE__*/function (_Array) {
  _inherits(GaimanArray, _Array);
  var _super = _createSuper(GaimanArray);
  function GaimanArray() {
    _classCallCheck(this, GaimanArray);
    return _super.apply(this, arguments);
  }
  _createClass(GaimanArray, [{
    key: "map",
    value: function map() {
      function call(arr) {
        return _construct(GaimanArray, _toConsumableArray(arr));
      }
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var arr = _get(_getPrototypeOf(GaimanArray.prototype), "map", this).apply(this, args);
      var some = _get(_getPrototypeOf(GaimanArray.prototype), "some", this);
      var has_promise = some.call(arr, is_promise);
      if (has_promise) {
        return Promise.all(arr).then(call);
      } else {
        return call(arr);
      }
    }
  }, {
    key: "forEach",
    value: function forEach() {
      return this.map.apply(this, arguments);
    }
  }, {
    key: "filter",
    value: function filter(fn, ctx) {
      var filter = _get(_getPrototypeOf(GaimanArray.prototype), "filter", this);
      function call(arr) {
        return _construct(GaimanArray, _toConsumableArray(filter.call(arr, function (x) {
          return x;
        })));
      }
      var items = this.map(fn, ctx);
      if (is_promise(items)) {
        return items.then(function (arr) {
          return call(arr);
        });
      } else {
        return call(items);
      }
    }
  }, {
    key: "reduce",
    value: function reduce(fn, init) {
      return _construct(GaimanArray, _toConsumableArray(_get(_getPrototypeOf(GaimanArray.prototype), "reduce", this).call(this, function (acc) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }
        if (is_promise(acc)) {
          return acc.then(function (acc) {
            return fn.apply(void 0, [acc].concat(args));
          });
        } else {
          return fn.apply(void 0, [acc].concat(args));
        }
      }, init)));
    }
  }, {
    key: "sort",
    value: function sort() {
      var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSortFn;
      return mergeSort(this, fn);
    }
  }, {
    key: "some",
    value: function some(fn, ctx) {
      var some = _get(_getPrototypeOf(GaimanArray.prototype), "some", this);
      return this.mapWithCallback(fn, function (arr) {
        return some.call(arr, function (x) {
          return x;
        });
      }, ctx);
    }
  }, {
    key: "every",
    value: function every(fn, ctx) {
      var every = _get(_getPrototypeOf(GaimanArray.prototype), "every", this);
      return this.mapWithCallback(fn, function (arr) {
        return every.call(arr, function (x) {
          return x;
        });
      }, ctx);
    }
  }, {
    key: "find",
    value: function find(fn, ctx) {
      var _this5 = this;
      return this.mapWithCallback(fn, function (arr) {
        var index = arr.findIndex(function (x) {
          return x;
        });
        return _this5[index];
      }, ctx);
    }
  }, {
    key: "flatMap",
    value: function flatMap(fn) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }
      return this.map.apply(this, args).flat();
    }
  }, {
    key: "mapWithCallback",
    value: function mapWithCallback(fn, callback, ctx) {
      var items = this.map(fn, ctx);
      if (is_promise(items)) {
        return items.then(function (arr) {
          return callback(arr);
        });
      } else {
        return callback(items);
      }
    }
  }]);
  return GaimanArray;
}( /*#__PURE__*/_wrapNativeSuper(Array));
function defaultSortFn(a, b) {
  if (typeof a !== 'string') {
    a = String(a);
  }
  if (typeof b !== 'string') {
    b = String(b);
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

// based on: https://rosettacode.org/wiki/Sorting_algorithms/Merge_sort#JavaScript
function mergeSort(_x2) {
  return _mergeSort.apply(this, arguments);
} // STD library
function _mergeSort() {
  _mergeSort = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(array) {
    var fn,
      mid,
      left,
      right,
      ia,
      il,
      ir,
      _args5 = arguments;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          fn = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : defaultSortFn;
          if (!(array.length <= 1)) {
            _context5.next = 3;
            break;
          }
          return _context5.abrupt("return", array);
        case 3:
          mid = Math.floor(array.length / 2), left = array.slice(0, mid), right = array.slice(mid);
          _context5.next = 6;
          return mergeSort(left, fn);
        case 6:
          _context5.next = 8;
          return mergeSort(right, fn);
        case 8:
          ia = 0, il = 0, ir = 0;
        case 9:
          if (!(il < left.length && ir < right.length)) {
            _context5.next = 21;
            break;
          }
          _context5.next = 12;
          return fn(left[il], right[ir]);
        case 12:
          _context5.t0 = _context5.sent;
          if (!(_context5.t0 <= 0)) {
            _context5.next = 17;
            break;
          }
          _context5.t1 = left[il++];
          _context5.next = 18;
          break;
        case 17:
          _context5.t1 = right[ir++];
        case 18:
          array[ia++] = _context5.t1;
          _context5.next = 9;
          break;
        case 21:
          while (il < left.length) {
            array[ia++] = left[il++];
          }
          while (ir < right.length) {
            array[ia++] = right[ir++];
          }
          return _context5.abrupt("return", array);
        case 24:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _mergeSort.apply(this, arguments);
}
function $_ord(x) {
  var type = _typeof(x);
  if (type !== 'string') {
    throw new Error("ord: Invalid argument, expected string got ".concat(type));
  }
  var len = _toConsumableArray(x).length;
  if (len > 1) {
    throw new Error('ord: argument need to be string of length 1');
  }
  return x.codePointAt(0);
}
function $_chr(x) {
  var type = _typeof(x);
  if (type !== 'number') {
    throw new Error("chr: Invalid argument, expected number got ".concat(type));
  }
  return String.fromCodePoint(x);
}
function $_range(start, stop, step) {
  if (!stop) {
    stop = start;
    start = 0;
  }
  if (!step) {
    if (start > stop) {
      step = -1;
    } else {
      step = 1;
    }
  }
  if (start > stop && step > 0) {
    return new GaimanArray();
  }
  var result = new GaimanArray();
  function run() {
    result.push(start);
    start += step;
  }
  if (start > stop) {
    while (start > stop) {
      run();
    }
  } else {
    while (start < stop) {
      run();
    }
  }
  return result;
}
var $_abs = Math.abs;
var $_acos = Math.acos;
var $_acosh = Math.acosh;
var $_asin = Math.asin;
var $_asinh = Math.asinh;
var $_atan = Math.atan;
var $_atanh = Math.atanh;
var $_atan2 = Math.atan2;
var $_ceil = Math.ceil;
var $_cbrt = Math.cbrt;
var $_expm1 = Math.expm1;
var $_clz32 = Math.clz32;
var $_cos = Math.cos;
var $_cosh = Math.cosh;
var $_exp = Math.exp;
var $_floor = Math.floor;
var $_fround = Math.fround;
var $_hypot = Math.hypot;
var $_imul = Math.imul;
var $_log = Math.log;
var $_log1p = Math.log1p;
var $_log2 = Math.log2;
var $_log10 = Math.log10;
var $_max = Math.max;
var $_min = Math.min;
var $_pow = Math.pow;
var $_random = Math.random;
var $_round = Math.round;
var $_sign = Math.sign;
var $_sin = Math.sin;
var $_sinh = Math.sinh;
var $_sqrt = Math.sqrt;
var $_tan = Math.tan;
var $_tanh = Math.tanh;
var $_trunc = Math.trunc;
var $_E = Math.E;
var $_LN10 = Math.LN10;
var $_LN2 = Math.LN2;
var $_LOG10E = Math.LOG10E;
var $_LOG2E = Math.LOG2E;
var $_PI = Math.PI;
var $_SQRT1_2 = Math.SQRT1_2;
var $_SQRT2 = Math.SQRT2;
var $_to_base64 = btoa;
var $_from_base64 = atob;
var $_sprintf = sprintf;
var $_cols = function $_cols() {
  return gaiman._term.cols();
};
var $_rows = function $_rows() {
  return gaiman._term.rows();
};
var $_delay = function $_delay(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

// Fisher-Yates (aka Knuth) Shuffle
// ref: https://stackoverflow.com/a/2450976/387194
function $_shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    var _ref3 = [array[randomIndex], array[currentIndex]];
    array[currentIndex] = _ref3[0];
    array[randomIndex] = _ref3[1];
  }
  return array;
}
var cookie, argv, gaiman, $$__m;
try {
  if (is_node()) {
    argv = process.argv;
  } else {
    cookie = parse_cookies(document.cookie);
    gaiman = new WebAdapter();
  }
  main();
} catch (e) {
  window.parent.postMessage({
    message: e.message,
    colno: null,
    lineno: null
  });
  throw e;
}
function main() {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          try {} catch (e) {
            gaiman.error(e);
          }
        case 1:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _main.apply(this, arguments);
}