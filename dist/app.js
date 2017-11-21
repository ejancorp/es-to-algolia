'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticdump = require('./lib/elasticdump');

var _elasticdump2 = _interopRequireDefault(_elasticdump);

var _algoliaconnect = require('./lib/algoliaconnect');

var _algoliaconnect2 = _interopRequireDefault(_algoliaconnect);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_dotenv2.default.config();

var App = function () {
  function App() {
    _classCallCheck(this, App);

    this.elasticdump = new _elasticdump2.default(process.env);
    this.algolaconnect = new _algoliaconnect2.default(process.env);
    this.migrationTotal = 0;
  }

  _createClass(App, [{
    key: 'init',
    value: function init() {
      this.elasticdump.dump(process.env.ELASTIC_INDEX, this.dumpCallback.bind(this), process.env.DUMP_LIMIT);
    }
  }, {
    key: 'dumpCallback',
    value: function dumpCallback(error, response) {
      var _this = this;

      if (error) {
        console.log(error);
      }

      var result = this.formatDump(response.hits);

      this.algolaconnect.pushObjects(result).then(function (content) {
        _this.migrationTotal += content.objectIDs.length;
        _this.logger('Migrated - ' + content.objectIDs.length + ' - ' + _this.migrationTotal);
        if (!_this.elasticdump.isDone()) {
          _this.elasticdump.nextScroll(_this.dumpCallback.bind(_this));
        } else {
          _this.logger('Migration Done - ' + _this.elasticdump.generatedCount);
        }
      }, function (error) {
        _this.logger(error);
      });
    }
  }, {
    key: 'formatDump',
    value: function formatDump(items) {
      var _this2 = this;

      var result = [];
      _lodash2.default.each(items, function (value, key) {
        if (_this2.isValidItem(value)) {
          var item = value._source;
          item.objectID = value._id;
          result.push(item);
        }
      }, this);
      return result;
    }
  }, {
    key: 'isValidItem',
    value: function isValidItem(data) {
      if (!data.hasOwnProperty('_source') || !data.hasOwnProperty('_id')) {
        return false;
      }
      return true;
    }
  }, {
    key: 'logger',
    value: function logger() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      console.log(new Date().toUTCString() + ' | ' + message);
    }
  }]);

  return App;
}();

var app = new App();
app.init();