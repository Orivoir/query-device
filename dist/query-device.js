(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

let QueryDevice = /*#__PURE__*/function () {
  "use strict";

  _createClass(QueryDevice, null, [{
    key: "parseMediaBrut",
    value: function parseMediaBrut(mediaBrut) {
      const mediasList = [];
      let parsed = null; // for not crash browser if infinity loop as: "never found last constraints media device"

      let securityLoop = 0;

      do {
        parsed = QueryDevice.parseOneMedia(mediaBrut);
        mediasList.push(parsed);
        mediaBrut = mediaBrut.replace(parsed.matchMedia, "");
        mediaBrut = mediaBrut.replace(parsed.realLogicOperator, "");
        mediaBrut = mediaBrut.trim();

        if (++securityLoop >= QueryDevice.SECURITY_LOOP_PARSE_MEDIA) {
          parsed = null;
          throw "QueryDevice Loop parse media have fail as `never found last constraints media device`";
        }
      } while (!parsed.isLast);

      return mediasList;
    }
  }, {
    key: "parseOneMedia",
    value: function parseOneMedia(mediaBrut) {
      if (!mediaBrut.length) return false;
      let close = null;
      let logicOperator = null;
      let realLogicOperator = null;
      QueryDevice.separators.forEach(function (sep) {
        const indexFind = mediaBrut.indexOf(sep);

        if (indexFind !== -1) {
          if (close === null || indexFind < close) {
            close = indexFind;
            realLogicOperator = sep;
            logicOperator = sep === "AND" ? "&&" : sep === "OR" ? "||" : sep;
          }
        }
      });

      if (close === null) {
        return {
          matchMedia: mediaBrut.trim(),
          isLast: true
        };
      }

      return {
        matchMedia: mediaBrut.substring(0, close).trim(),
        logicOperator: logicOperator,
        realLogicOperator: realLogicOperator,
        isLast: false
      };
    }
  }, {
    key: "device2mediaBrut",
    value: function device2mediaBrut(device) {
      if (typeof device === "string") {
        device = {
          size: device
        };
      }

      if (typeof device !== "object" || typeof device.size !== "string") {
        throw new RangeError('`device size` should be a `object` or `string` value');
      }

      const [w, h] = device.size.split('x').map(function (side) {
        return parseInt(side);
      });
      return `min-width: ${w}px && min-height: ${h}px`;
    }
  }, {
    key: "findDeviceByName",
    value: function findDeviceByName(deviceName) {
      if (typeof deviceName !== "string") {
        throw new RangeError('`deviceName` should be a `string` value');
      }

      deviceName = deviceName.toLocaleLowerCase();
      return QueryDevice.deviceList.find(function (d) {
        return d.name.toLocaleLowerCase() === deviceName;
      }) || null;
    }
  }, {
    key: "SECURITY_LOOP_PARSE_MEDIA",
    get: function () {
      return 48;
    }
  }, {
    key: "deviceList",
    get: function () {
      return require('./../stockage/device-list.json');
    }
  }, {
    key: "separators",
    get: function () {
      return ["||", "&&", "AND", "OR"];
    }
  }, {
    key: "IS_OR",
    get: function () {
      return true;
    }
  }, {
    key: "IS_AND",
    get: function () {
      return false;
    }
  }]);

  function QueryDevice() {
    _classCallCheck(this, QueryDevice);

    this.mediaEvents = [];

    if (process.env.NODE_ENV !== "test") {
      if (!(window.matchMedia instanceof Function)) {
        throw "Browser do not support API window.matchMedia";
      }
    }

    this.onResizeWindow = this.onResizeWindow.bind(this);
  }

  _createClass(QueryDevice, [{
    key: "poolEvent",
    value: function poolEvent() {
      if (process.env.NODE_ENV !== "test") {
        window[(this.mediaEvents.length > 0 ? "add" : "remove") + "EventListener"]('resize', this.onResizeWindow);
      }
    }
  }, {
    key: "onResizeWindow",
    value: function onResizeWindow() {
      this.mediaEvents.forEach(function (me) {
        const isMatch = eval(me.eval);

        if (isMatch !== me.isLastMatch) {
          me.isLastMatch = isMatch;
          me.callback(isMatch);
        }
      });
    }
  }, {
    key: "addDevice",
    value: function addDevice(deviceName, callback, idQueryDevice = null) {
      const device = QueryDevice.findDeviceByName(deviceName);

      if (device) {
        idQueryDevice = typeof idQueryDevice === "string" ? idQueryDevice : deviceName;
        this.add(QueryDevice.device2mediaBrut(device), callback, idQueryDevice);
        return device.size;
      }

      return false;
    }
  }, {
    key: "add",
    value: function add(mediaBrut, callback, idQueryDevice = null) {
      if (!(callback instanceof Function)) {
        throw new RangeError("arg2: ( boolean: isMatches ) => void, should be a function");
      }

      const isStringMediaMatch = typeof mediaBrut === "string";

      if (isStringMediaMatch) {
        mediaBrut = mediaBrut.trim();
      } // if give a format: "aaaxbbb" eg: "414x640"


      if (isStringMediaMatch && /^[\d]{3,4}\x[\d]{3,4}$/.test(mediaBrut)) {
        mediaBrut = QueryDevice.device2mediaBrut({
          size: mediaBrut
        });
      } // if have give a device object as query device


      if (typeof mediaBrut === "object" && typeof mediaBrut.name === "string") {
        mediaBrut = mediaBrut.name;
      }

      const device = QueryDevice.findDeviceByName(mediaBrut);

      if (device) {
        return this.addDevice(device.name, callback, idQueryDevice);
      }

      this.mediaParsed = QueryDevice.parseMediaBrut(mediaBrut);
      this.mediaEval = this.mediaParsed.map(function (mediaParsedItem) {
        return `window.matchMedia("(${mediaParsedItem.matchMedia})").matches ${mediaParsedItem.logicOperator || ""}`;
      }).join(" ").trim();
      this.mediaEvents.push({
        eval: this.mediaEval,
        callback: callback,
        id: typeof idQueryDevice === "string" ? idQueryDevice : null
      });
      delete this.mediaParsed;
      delete this.mediaEval; // re calcul if should attach a global event resize

      this.poolEvent();
    }
  }, {
    key: "remove",
    value: function remove(idQueryDevice) {
      const sizeBefore = this.mediaEvents.length;
      this.mediaEvents = this.mediaEvents.filter(function (me) {
        return me.id !== idQueryDevice;
      }); // re calcul if should attach a global event resize

      this.poolEvent();
      return sizeBefore - this.mediaEvents.length;
    }
  }, {
    key: "mediaBrut",
    set: function (mediaBrut) {
      this._mediaBrut = typeof mediaBrut === "string" ? mediaBrut.trim() : null;

      if (!this._mediaBrut) {
        throw new SyntaxError("media query invalid format");
      }
    },
    get: function () {
      return this._mediaBrut;
    }
  }, {
    key: "size",
    get: function () {
      return this.mediaEvents.length;
    }
  }]);

  return QueryDevice;
}();

;

if (process.env.NODE_ENV !== "test") {
  window.queryDevice = function () {
    return new QueryDevice();
  }; // public scope static elements


  window.queryDevice.deviceList = QueryDevice.deviceList;
  window.queryDevice.findDeviceByName = QueryDevice.findDeviceByName;
}

module.exports = QueryDevice;
}).call(this,require('_process'))
},{"./../stockage/device-list.json":5,"@babel/runtime/helpers/classCallCheck":2,"@babel/runtime/helpers/createClass":3,"_process":4}],2:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],3:[function(require,module,exports){
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

module.exports = _createClass;
},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports=[
    {
        "name": "iPhone XR", "size": "414x896"
    },{
        "name": "iPhone XS", "size":"375x812"
    },{
        "name": "iPhone XS Max", "size":"414x896"
    },{
        "name": "iPhone X", "size":"375x812"
    },{
        "name": "iPhone 8 Plus", "size":"414x736"
    },{
        "name":"iPhone 8", "size":"375x667"
    },{
        "name": "iPhone 7 Plus", "size": "414x736"
    },{
        "name": "iPhone 7" ,"size":"375x667"
    },{
        "name": "iPhone 6 Plus", "size":"414x736"
    },{
        "name": "iPhone 6", "size":"375x667"
    },{
        "name": "iPhone 6S", "size":"375x667"
    },{
        "name": "iPhone 5", "size": "320x568"
    },{
        "name": "Samsung Galaxy Note 3", "size": "360x640"
    },{
        "name": "iPhone 5SE", "size": "320x568"
    },{
        "name": "Android One", "size": "320x569"
    },{
        "name": "Asus Zen Watch", "size": "213x213"
    },{
        "name": "Dell Venue 8", "size": "800x1280"
    },{
        "name": "HTC One M8", "size": "360x640"
    },{
        "name": "HTC One M9", "size": "360x640"
    },{
        "name": "LG G Watch", "size": "187x187"
    },{
        "name": "LG G Watch R", "size": "213x213"
    },{
        "name": "LG G2", "size": "360x640"
    },{
        "name": "LG G3", "size": "480x853"
    },{
        "name": "Moto 360", "size": "241x218"
    },{
        "name": "Moto 360 v2 42mm", "size": "241x244"
    },{
        "name": "Moto 360 v2 46mm", "size": "241x248"
    },{
        "name": "Moto G", "size": "360x640"
    },{
        "name": "Moto X", "size": "360x640"
    },{
        "name": "Moto X (2nd Gen)", "size": "360x640"
    },{
        "name": "Nexus 10", "size": "1280x800"
    },{
        "name": "Nexus 4", "size": "384x640"
    },{
        "name": "Nexus 5", "size": "360x640"
    },{
        "name": "Nexus 6", "size": "411x731"
    },{
        "name": "Nexus 5X", "size": "411x731"
    },{
        "name": "Nexus 6P", "size": "411x731"
    },{
        "name": "Google Pixel", "size": "411x731"
    },{
        "name": "Google Pixel XL", "size": "411x731"
    },{
        "name": "Nexus 7 ('12)", "size": "600x960"
    },{
        "name": "Nexus 7 ('13)", "size": "600x960"
    },{
        "name": "Nexus 9", "size": "1024x768"
    },{
        "name": "Samsung Galaxy Note 4", "size": "480x853"
    },{
        "name": "Samsung Galaxy S5", "size": "360x640"
    },{
        "name": "Samsung Galaxy S6", "size": "360x640"
    },{
        "name": "Samsung Galaxy S7", "size": "360x640"
    },{
        "name": "Samsung Galaxy S7 Edge", "size": "360x640"
    },{
        "name": "Samsung Galaxy S8", "size": "360x740"
    },{
        "name": "Samsung Galaxy S8+", "size": "360x740"
    },{
        "name": "Samsung Galaxy Tab 10", "size": "800x1280"
    },{
        "name": "Samsung Gear Live", "size": "213x213"
    },{
        "name": "Sony Smartwatch 3", "size": "213x213"
    },{
        "name": "Sony Xperia Z Ultra", "size": "540x960"
    },{
        "name": "Sony Xperia Z1 Compact", "size": "360x640"
    },{
        "name": "Sony Xperia Z2/Z3", "size": "360x640"
    },{
        "name": "Sony Xperia Z3 Compact", "size": "360x640"
    },{
        "name": "Sony Xperia C4", "size": "540x960"
    },{
        "name": "Sony Xperia Z4 Tablet", "size": "1280x800"
    },{
        "name": "Sony Xperia Z3 Tablet", "size": "960x600"
    },{
        "name": "Chromebook 11", "size": "1366x768"
    },{
        "name": "Chromebook Pixel", "size": "1280x850"
    },{
        "name": "Chromebox 30", "size": "2560x1600"
    },{
        "name": "Apple Watch 38mm", "size": "136x170"
    },{
        "name": "Apple Watch 42mm", "size": "156x195"
    },{
        "name": "iPad", "size": "768x1024"
    },{
        "name": "iPad Mini", "size": "768x1024"
    },{
        "name": "iPad Mini Retina", "size": "768x1024"
    },{
        "name": "iPad Retina", "size": "768x1024"
    },{
        "name": "iPad Pro", "size": "1366x1024"
    },{
        "name": "iPhone", "size": "320x480"
    },{
        "name": "iPhone 4", "size": "320x480"
    },{
        "name": "iMac 5K", "size": "2560x1440"
    },{
        "name": "MacBook 12", "size": "1280x800"
    },{
        "name": "MacBook Air 11", "size": "1366x768"
    },{
        "name": "MacBook Air 13", "size": "1440x900"
    },{
        "name": "MacBook Pro 13", "size": "1280x800"
    },{
        "name": "MacBook Pro 15", "size": "1440x900"
    },{
        "name": "iMac 27", "size": "2560x1440"
    },{
        "name": "Surface", "size": "1366x768"
    },{
        "name": "Surface 2", "size": "1280x720"
    },{
        "name": "Surface 3", "size": "1280x720"
    },{
        "name": "Surface Pro", "size": "1280x720"
    },{
        "name": "Surface Pro 3", "size": "1440x960"
    },{
        "name": "Surface Pro 4", "size": "1368x912"
    },{
        "name": "Surface Book", "size": "1500x1000"
    }
]
},{}]},{},[1]);
