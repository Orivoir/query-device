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