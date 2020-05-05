(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

let QueryDevice = /*#__PURE__*/function () {
  "use strict";

  _createClass(QueryDevice, null, [{
    key: "parseMediaMatchBrut",
    value: function parseMediaMatchBrut(mediaMatchBrut) {
      const mediasList = [];
      let parsed = null; // for not crash browser if infinity loop as: "never found last constraints media device"

      let securityLoop = 0;

      do {
        parsed = QueryDevice.parseOneMedia(mediaMatchBrut);
        mediasList.push(parsed);
        mediaMatchBrut = mediaMatchBrut.replace(parsed.matchMedia, "");
        mediaMatchBrut = mediaMatchBrut.replace(parsed.realLogicOperator, "");
        mediaMatchBrut = mediaMatchBrut.trim();

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
        matchMedia: mediaBrut.substring(open, close).trim(),
        logicOperator: logicOperator,
        realLogicOperator: realLogicOperator,
        isLast: false
      };
    }
  }, {
    key: "device2mediaBrut",
    value: function device2mediaBrut(device) {
      const [w, h] = device.size.split('x').map(function (side) {
        return parseInt(side);
      });
      return `min-width: ${w}px && min-height: ${h}px`;
    }
  }, {
    key: "findDeviceByName",
    value: function findDeviceByName(deviceName) {
      deviceName = deviceName.toLocaleLowerCase();
      return QueryDevice.deviceList.find(function (d) {
        return d.name.toLocaleLowerCase() === deviceName;
      });
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

    if (!(window.matchMedia instanceof Function)) {
      throw "Browser do not support API window.matchMedia";
    }

    this.onResizeWindow = this.onResizeWindow.bind(this);
  }

  _createClass(QueryDevice, [{
    key: "poolEvent",
    value: function poolEvent() {
      window[(this.mediaEvents.length > 0 ? "add" : "remove") + "EventListener"]('resize', this.onResizeWindow);
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
    value: function add(mediaMatchBrut, callback, idQueryDevice = null) {
      if (!(callback instanceof Function)) {
        throw "arg2:callback should be a function";
      }

      const isStringMediaMatch = typeof mediaMatchBrut === "string";

      if (isStringMediaMatch) {
        mediaMatchBrut = mediaMatchBrut.trim();
      } // if give a format: "aaaxbbb" eg: "414x640"


      if (isStringMediaMatch && /^[\d]{3,4}\x[\d]{3,4}$/.test(mediaMatchBrut)) {
        mediaMatchBrut = QueryDevice.device2mediaBrut({
          size: mediaMatchBrut
        });
      } // if have give a device object as media to matches


      if (typeof mediaMatchBrut === "object" && typeof mediaMatchBrut.name === "string") {
        mediaMatchBrut = mediaMatchBrut.name;
      }

      const device = QueryDevice.findDeviceByName(mediaMatchBrut);

      if (device) {
        return this.addDevice(device.name, callback, idQueryDevice);
      }

      this.mediaParsed = QueryDevice.parseMediaMatchBrut(mediaMatchBrut);
      this.mediaEval = this.mediaParsed.map(function (mediaParsedItem) {
        return `window.matchMedia("(${mediaParsedItem.matchMedia})").matches ${mediaParsedItem.logicOperator || ""}`;
      }).join(" ").trim();
      this.mediaEvents.push({
        eval: this.mediaEval,
        callback: callback,
        id: typeof idQueryDevice === "string" ? idQueryDevice : null
      });
      delete this.mediaParsed;
      delete this.mediaEval;
      this.poolEvent();
    }
  }, {
    key: "remove",
    value: function remove(idQueryDevice) {
      const sizeBefore = this.mediaEvents.length;
      this.mediaEvents = this.mediaEvents.filter(function (me) {
        return me.id !== idQueryDevice;
      });
      this.poolEvent();
      return sizeBefore - this.mediaEvents.length;
    }
  }, {
    key: "mediaMatchBrut",
    set: function (mediaMatchBrut) {
      this._mediaMatchBrut = typeof mediaMatchBrut === "string" ? mediaMatchBrut.trim() : null;

      if (!this._mediaMatchBrut) {
        throw new SyntaxError("mediaMatch invalid format");
      }
    },
    get: function () {
      return this._mediaMatchBrut;
    }
  }]);

  return QueryDevice;
}();

;

window.queryDevice = function () {
  return new QueryDevice();
}; // public scope static elements


window.queryDevice.deviceList = QueryDevice.deviceList;
window.queryDevice.findDeviceByName = QueryDevice.findDeviceByName;
module.exports = QueryDevice;
},{"./../stockage/device-list.json":4,"@babel/runtime/helpers/classCallCheck":2,"@babel/runtime/helpers/createClass":3}],2:[function(require,module,exports){
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
module.exports=[
    {
        "name": "iPhone XR", "size": "414x896"
    },
    {
        "name": "iPhone XS", "size":"375x812"
    },
    {
        "name": "iPhone XS Max", "size":"414x896"
    },
    {
        "name": "iPhone X", "size":"375x812"
    },
    {
        "name": "iPhone 8 Plus", "size":"414x736"
    },
    {
        "name":"iPhone 8", "size":"375x667"
    },
    {
        "name": "iPhone 7 Plus", "size": "414x736"
    },
    {
        "name": "iPhone 7" ,"size":"375x667"
    },
    {
        "name": "iPhone 6 Plus/6S Plus", "size":"414x736"
    },
    {
        "name": "iPhone 6/6S", "size":"375x667"
    },
    {
        "name": "iPhone 5", "size": "320x568"
    }
]
},{}]},{},[1]);
