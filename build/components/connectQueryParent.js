'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
exports.default = function () {
  var _class, _temp, _initialiseProps;

  var getInitialQueryParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var getQueries = arguments[1];
  return (
    /**
     * A Component which manages a set of Queries and passes the output
     * of those queries into its child component.
     *
     * @class QueryContainer
     * @extends {react.Component}
     */
    _temp = _class = function (_Component) {
      _inherits(Query, _Component);

      /**
       * Call getQueries to get our QueryBuilder instances, and populate
       * state with the Query Parameters and Query Results (initially results
       * are all [])
       *
       * @method constructor
       */
      function Query(props, context) {
        _classCallCheck(this, Query);

        var _this = _possibleConstructorReturn(this, (Query.__proto__ || Object.getPrototypeOf(Query)).call(this, props, context));

        _initialiseProps.call(_this);

        _this.client = props.client || context.client;
        _this.queries = {};
        _this.callbacks = {};

        _this.queryParams = typeof getInitialQueryParams === 'function' ? getInitialQueryParams(props) : getInitialQueryParams;

        _this.queryBuilders = getQueries(props, _this.queryParams);

        // Set initial queryResults to empty arrays.
        _this.queryResults = Object.keys(_this.queryBuilders).reduce(function (obj, key) {
          return _extends({}, obj, _defineProperty({}, key, []));
        }, {});
        return _this;
      }

      /**
       * On mounting (and once the client is ready) call _updateQueries
       */


      // Necessary in order to grab client out of the context.
      // TODO: May want to rename to layerClient to avoid conflicts.


      _createClass(Query, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.client.on('ready', this._onClientReady);

          if (this.client.isReady) {
            this._updateQueries(this.props, this.state.queryParams);
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
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

      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          var _this2 = this;

          // When the component unmounts, unsubscribe from all event listeners.
          Object.keys(this.queries).forEach(function (key) {
            var query = _this2.queries[key];
            query.off('change', _this2.callbacks[query.internalId]);
            _this2.client.off('ready', _this2._onClientReady, _this2);
          });
        }
      }]);

      return Query;
    }(_react.Component), _class.propTypes = {
      client: _propTypes2.default.object }, _class.contextTypes = {
      client: _propTypes2.default.object }, _initialiseProps = function _initialiseProps() {
      var _this3 = this;

      this._onClientReady = function () {
        _this3._updateQueries(_this3.props, _this3.state.queryParams);
      };

      this.setQueryParams = function (nextQueryParams, callback) {
        _this3._updateQueries(_this3.props, nextQueryParams, callback);
      };

      this._updateQueries = function (props, queryParams, callback) {
        var queryBuilders = getQueries(props, queryParams);

        // Remove any queries that no longer exist
        Object.keys(_this3.queries).forEach(function (key) {
          if (!queryBuilders[key]) {
            var query = _this3.queries[key];
            query.off('change', _this3.callbacks[query.internalId]);

            delete _this3.queries[key];
            delete _this3.callbacks[query.internalId];
          }
        });

        // Update existing queries / Create new queries
        Object.keys(queryBuilders).forEach(function (key) {
          var query = _this3.queries[key];
          var builder = queryBuilders[key];

          if (query) {
            query.update(builder.build());
          } else {
            var newQuery = _this3.client.createQuery(builder);

            _this3.queries[key] = newQuery;
            _this3.callbacks[newQuery.internalId] = function () {
              _this3._onQueryChange(key, newQuery.data);
            };

            newQuery.on('change', _this3.callbacks[newQuery.internalId]);
          }
        });

        _this3.setState({
          queryParams: queryParams
        }, callback);
      };
    }, _temp
  );
};