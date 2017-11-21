'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _algoliasearch = require('algoliasearch');

var _algoliasearch2 = _interopRequireDefault(_algoliasearch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class AlgoliaConnect
 */
var AlgoliaConnect = function () {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  function AlgoliaConnect(settings) {
    _classCallCheck(this, AlgoliaConnect);

    this.client = (0, _algoliasearch2.default)(settings.ALGOLIA_APP_ID, settings.ALGOLIA_SECRET);
    this.index = this.client.initIndex(settings.ALGOLIA_INDEX);
  }
  /**
   * [pushObjects description]
   * @param  {Array}  [items=[]] [description]
   * @return {[type]}            [description]
   */


  _createClass(AlgoliaConnect, [{
    key: 'pushObjects',
    value: function pushObjects() {
      var _this = this;

      var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_lodash2.default.isEmpty(items)) {
        return false;
      }
      return new Promise(function (resolve, reject) {
        _this.index.addObjects(items, function (error, content) {
          if (error) {
            return reject(error);
          }
          return resolve(content);
        });
      });
    }
  }]);

  return AlgoliaConnect;
}();

exports.default = AlgoliaConnect;