import elasticsearch from 'elasticsearch';
import AgentKeepAlive from 'agentkeepalive';
import _ from 'lodash';

/**
 * @class ElasticDump
 */
class ElasticDump {
  /**
   * [constructor description]
   * @param  {[type]} settings [description]
   * @return {[type]}          [description]
   */
  constructor(settings) {
    this.client = new elasticsearch.Client({
      hosts: [
        {
          host: _.isNull(settings.ELASTIC_HOST) ? 'localhost' : settings.ELASTIC_HOST,
          port: _.isNull(settings.ELASTIC_PORT) ? 9200 : settings.ELASTIC_PORT,
          auth: _.isNull(settings.ELASTIC_AUTH) ? '' : settings.ELASTIC_AUTH,
          protocol: _.isNull(settings.ELASTIC_PROTOCOL) ? 'http' : settings.ELASTIC_PROTOCOL,
        },
      ],
      maxSockets: 10,
      minSockets: 10,
      requestTimeout: Infinity,
      keepAlive: true,
      createNodeAgent(connection, config) {
        if (settings.ELASTIC_PROTOCOL == 'https') { return new AgentKeepAlive.HttpsAgent(connection.makeAgentConfig(config)); }

        return new AgentKeepAlive(connection.makeAgentConfig(config));
      },
    });
    this.lastScrollId = null;
    this.scrollTime = '10m';

    this.totalCount = 0;
    this.generatedCount = 0;
  }
  /**
   * [dump description]
   * @param  {[type]}  index                [description]
   * @param  {Boolean} [dumpCallback=false] [description]
   * @param  {Number}  [limit=100]          [description]
   * @param  {Object}  [query={}]           [description]
   * @param  {String}  [scroll='10m']       [description]
   * @return {[type]}                       [description]
   */
  dump(index, dumpCallback = false, limit = 100, query = {}, scroll = '10m') {
    this.scrollTime = scroll;
    this.client.search({
      size: limit,
      index,
      scroll,
      body: query,
    }, this.scrollDump.bind(this, dumpCallback));
  }
  /**
   * [scrollDump description]
   * @param  {[type]} dumpCallback [description]
   * @param  {[type]} error        [description]
   * @param  {[type]} response     [description]
   * @return {[type]}              [description]
   */
  scrollDump(dumpCallback, error, response) {
    if (error) {
      if (_.isFunction(dumpCallback)) {
        return dumpCallback.call(null, error, null);
      }
      console.error(error);
      process.exit();
    }

    this.lastScrollId = response._scroll_id;
    this.totalCount = response.hits.total;
    this.generatedCount += Object.keys(response.hits.hits).length;

    if (_.isFunction(dumpCallback)) {
      return dumpCallback.call(null, null, response.hits);
    }
  }
  /**
   * [nextScroll description]
   * @param  {[type]} dumpCallback [description]
   * @return {[type]}              [description]
   */
  nextScroll(dumpCallback) {
    this.client.scroll({
      scrollId: this.lastScrollId,
      scroll: this.scrollTime,
    }, this.scrollDump.bind(this, dumpCallback));
  }
  /**
   * [isDone description]
   * @return {Boolean} [description]
   */
  isDone() {
    if (this.totalCount > this.generatedCount) {
      return false;
    }
    return true;
  }
}

export { ElasticDump as default };
