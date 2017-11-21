'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _agentkeepalive = require('agentkeepalive');

var _agentkeepalive2 = _interopRequireDefault(_agentkeepalive);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class ElasticDump
 */
var ElasticDump =
/**
 * [constructor description]
 * @param  {[type]} settings [description]
 * @return {[type]}          [description]
 */
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
};

exports.default = ElasticDump;