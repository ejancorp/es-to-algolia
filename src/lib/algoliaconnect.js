import algoliasearch from 'algoliasearch';
import _ from 'lodash';

/**
 * @class AlgoliaConnect
 */
class AlgoliaConnect {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor(settings) {
    this.client = algoliasearch(settings.ALGOLIA_APP_ID, settings.ALGOLIA_SECRET);
    this.index = this.client.initIndex(settings.ALGOLIA_INDEX);
  }
  /**
   * [pushObjects description]
   * @param  {Array}  [items=[]] [description]
   * @return {[type]}            [description]
   */
  pushObjects(items = []) {
    if (_.isEmpty(items)) {
      return false;
    }
    return new Promise(((resolve, reject) => {
      this.index.addObjects(items, (error, content) => {
        if (error) {
          return reject(error);
        }
        return resolve(content);
      });
    }));
  }
}

export { AlgoliaConnect as default };
