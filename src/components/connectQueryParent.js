import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Provides base Layer query functionality.
 * Intended to be subclassed, does not provide a Render method.
 * Built to abstract functionality to a higher level, so different
 * store implementations can be used (see connectQuery and connectReduxQuery).
 * See below for an example usage.
 *
      class QueryContainer extends connectQueryParent(getInitialQueryParams, getQueries)
 *
 * @method connectQuery
 * @param  {Object|Function} getInitialQueryParams   Initial properties for all queries
 * @param  {Function} getQueries          A function that returns a hash of QueryBuilders
 * @param {Object} getQueries.props       All properties passed in from the parent of this component
 * @param {Object} getQueries.queryParams Initial property values as specified by getInitialQueryParams
 * @param {Object} getQueries.return      A hash of Query instances
 * @return {Function}                     Call this function to create a parent component to extend Query
 *                                        subclasses
 */
export default (getInitialQueryParams = {}, getQueries) =>
  /**
   * A Component which manages a set of Queries and passes the output
   * of those queries into its child component.
   *
   * @class QueryContainer
   * @extends {react.Component}
   */
  class Query extends Component {
    static propTypes = {
      client: PropTypes.object,
    }

    // Necessary in order to grab client out of the context.
    // TODO: May want to rename to layerClient to avoid conflicts.
    static contextTypes = {
      client: PropTypes.object,
    }

    /**
     * Call getQueries to get our QueryBuilder instances, and populate
     * state with the Query Parameters and Query Results (initially results
     * are all [])
     *
     * @method constructor
     */
    constructor(props, context) {
      super(props, context);

      this.client = props.client || context.client;
      this.queries = {};
      this.callbacks = {};

      this.queryParams = (typeof getInitialQueryParams === 'function')
        ? getInitialQueryParams(props)
        : getInitialQueryParams;

      this.queryBuilders = getQueries(props, this.queryParams);

      // Set initial queryResults to empty arrays.
      this.queryResults = Object.keys(this.queryBuilders).reduce((obj, key) => ({
        ...obj,
        [key]: [],
      }), {});
    }

    /**
     * On mounting (and once the client is ready) call _updateQueries
     */
    componentWillMount() {
      this.client.on('ready', this._onClientReady);

      if (this.client.isReady) {
        this._updateQueries(this.props, this.state.queryParams);
      }
    }

    _onClientReady = () => {
      this._updateQueries(this.props, this.state.queryParams);
    }

    setQueryParams = (nextQueryParams, callback) => {
      this._updateQueries(this.props, nextQueryParams, callback);
    }

    componentWillReceiveProps(nextProps) {
      this._updateQueries(nextProps, this.state.queryParams);
    }

    /**
     * Generate the this.queries object to contain
     * layer.Query instances based on the getQueries()
     * QueryBuilders.  If the query already exists, update
     * it rather than replace it.
     *
     * @method _updateQueries
     * @private
     * @param  {Object}   props       Component properties
     * @param  {Object}   queryParams Query properties
     * @param  {Function} callback
     */
    _updateQueries = (props, queryParams, callback) => {
      const queryBuilders = getQueries(props, queryParams);

      // Remove any queries that no longer exist
      Object.keys(this.queries).forEach((key) => {
        if (!queryBuilders[key]) {
          const query = this.queries[key];
          query.off('change', this.callbacks[query.internalId]);

          delete this.queries[key];
          delete this.callbacks[query.internalId];
        }
      });

      // Update existing queries / Create new queries
      Object.keys(queryBuilders).forEach((key) => {
        const query = this.queries[key];
        const builder = queryBuilders[key];

        if (query) {
          query.update(builder.build());
        } else {
          const newQuery = this.client.createQuery(builder);

          this.queries[key] = newQuery;
          this.callbacks[newQuery.internalId] = () => {
            this._onQueryChange(key, newQuery.data);
          };

          newQuery.on('change', this.callbacks[newQuery.internalId]);
        }
      });

      this.setState({
        queryParams,
      }, callback);
    }

    componentWillUnmount() {
      // When the component unmounts, unsubscribe from all event listeners.
      Object.keys(this.queries).forEach((key) => {
        const query = this.queries[key];
        query.off('change', this.callbacks[query.internalId]);
        this.client.off('ready', this._onClientReady, this);
      });
    }
  };
