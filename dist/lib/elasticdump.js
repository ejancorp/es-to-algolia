'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _agentkeepalive = require('agentkeepalive');

var _agentkeepalive2 = _interopRequireDefault(_agentkeepalive);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ElasticDump = function () {
  function ElasticDump(settings) {
    _classCallCheck(this, ElasticDump);

    this.client = new _elasticsearch2.default.Client({
      hosts: [{
        host: _lodash2.default.isNull(settings.host) ? 'localhost' : settings.host,
        port: _lodash2.default.isNull(settings.port) ? 9200 : settings.port,
        auth: _lodash2.default.isNull(settings.auth) ? '' : settings.auth,
        protocol: _lodash2.default.isNull(settings.protocol) ? 'http' : settings.protocol
      }],
      maxSockets: 10,
      minSockets: 10,
      requestTimeout: Infinity,
      keepAlive: true,
      createNodeAgent: function createNodeAgent(connection, config) {
        if (settings.protocol == 'https') {
          return new _agentkeepalive2.default.HttpsAgent(connection.makeAgentConfig(config));
        }

        return new _agentkeepalive2.default(connection.makeAgentConfig(config));
      }
    });
    this.lastScrollId = null;
    this.scrollTime = '10m';

    this.totalCount = 0;
    this.generatedCount = 0;
  }

  _createClass(ElasticDump, [{
    key: 'dump',
    value: function dump(index) {
      var dumpCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
      var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var scroll = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '10m';

      this.scrollTime = scroll;
      this.client.search({
        size: limit,
        index: index,
        scroll: scroll,
        body: query
      }, this.scrollDump.bind(this, dumpCallback));
    }
  }, {
    key: 'scrollDump',
    value: function scrollDump(dumpCallback, error, response) {
      if (error) {
        if (_lodash2.default.isFunction(dumpCallback)) {
          return dumpCallback.call(null, error, null);
        }
        console.error(error);
        process.exit();
      }

      this.lastScrollId = response._scroll_id;
      this.totalCount = response.hits.total;
      this.generatedCount += Object.keys(response.hits.hits).length;

      if (_lodash2.default.isFunction(dumpCallback)) {
        return dumpCallback.call(null, null, response.hits);
      }
    }
  }, {
    key: 'nextScroll',
    value: function nextScroll(dumpCallback) {
      this.client.scroll({
        scrollId: this.lastScrollId,
        scroll: this.scrollTime
      }, this.scrollDump.bind(this, dumpCallback));
    }
  }, {
    key: 'isDone',
    value: function isDone() {
      if (this.totalCount > this.generatedCount) {
        return false;
      }
      return true;
    }
  }]);

  return ElasticDump;
}();

exports.default = ElasticDump;