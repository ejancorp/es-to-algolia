import ElasticDump from './lib/elasticdump';
import AlgoliaConnect from './lib/algoliaconnect';
import dotenv from 'dotenv';
import _ from 'lodash';

dotenv.config();

/**
 * [app description]
 * @type {App}
 */
class App {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor() {
    this.elasticdump = new ElasticDump(process.env);
    this.algolaconnect = new AlgoliaConnect(process.env);
    this.migrationTotal = 0;
  }
  /**
   * [init description]
   * @return {[type]} [description]
   */
  init() {
    this.elasticdump.dump(process.env.ELASTIC_INDEX, this.dumpCallback.bind(this), process.env.DUMP_LIMIT);
  }
  /**
   * [dumpCallback description]
   * @param  {[type]} error    [description]
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
   */
  dumpCallback(error, response) {
    if (error) {
      console.log(error);
    }

    const result = this.formatDump(response.hits);

    this.algolaconnect.pushObjects(result).then((content) => {
      this.migrationTotal += content.objectIDs.length;
      this.logger(`Migrated - ${content.objectIDs.length} - ${this.migrationTotal}`);
      if (!this.elasticdump.isDone()) {
        this.elasticdump.nextScroll(this.dumpCallback.bind(this));
      } else {
        this.logger(`Migration Done - ${this.elasticdump.generatedCount}`);
      }
    }, (error) => {
      this.logger(error);
    });
  }
  /**
   * [formatDump description]
   * @param  {[type]} items [description]
   * @return {[type]}       [description]
   */
  formatDump(items) {
    const result = [];
    _.each(items, (value, key) => {
      if (this.isValidItem(value)) {
        const item = value._source;
        item.objectID = value._id;
        result.push(item);
      }
    }, this);
    return result;
  }
  /**
   * [isValidItem description]
   * @param  {[type]}  data [description]
   * @return {Boolean}      [description]
   */
  isValidItem(data) {
    if (!data.hasOwnProperty('_source') || !data.hasOwnProperty('_id')) {
      return false;
    }
    return true;
  }
  /**
   * [logger description]
   * @param  {String} [message=""] [description]
   * @return {[type]}              [description]
   */
  logger(message = '') {
    console.log(`${new Date().toUTCString()} | ${message}`);
  }
}

/**
 * [app description]
 * @type {App}
 */
const app = new App();
app.init();
