'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _connectQueryParent2 = require('./connectQueryParent');

var _connectQueryParent3 = _interopRequireDefault(_connectQueryParent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Connects your Queries to your React Component properties.
 * In the example below, a ConversationList is passed in,
 * and a ConversationListContainer that contains a child of ConversationList
 * and which provides ConversationList with properties provided
 * by the queries.
 *
      function getInitialQueryParams (props) {
        return {
          paginationWindow: props.startingPaginationWindow || 100
        };
      }

      function getQueries(props, queryParams) {
        return {
          conversations: QueryBuilder.conversations().paginationWindow(queryParams.paginationWindow)
        };
      }

      var ConversationListContainer = connectQuery(getInitialQueryParams, getQueries)(ConversationList);
 *
 * @method connectQuery
 * @param  {Object|Function} getInitialQueryParams   Initial properties for all queries
 * @param  {Function} getQueries          A function that returns a hash of QueryBuilders
 * @param {Object} getQueries.props       All properties passed in from the parent of this component
 * @param {Object} getQueries.queryParams Initial property values as specified by getInitialQueryParams
 * @param {Object} getQueries.return      A hash of Query instances
 * @return {Function}                     Call this function to create a wrapped component which can be
 *                                        be rendered and which passes query data to your component.
 */
exports.default = function () {
  var getInitialQueryParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var getQueries = arguments[1];
  return (
    /**
     * Takes a Component, and wraps it with a QueryContainer (makes the
     * input Component a child Component of the QueryContainer) and
     * passes in Query data to the wrapped Component in the form of properties.
     * Note that the property names will match the keys returned by getQueries().
     *
     * @method
     * @param  {Component} ComposedComponent   The Component to wrap
     * @return {QueryContainer}                A Component that wraps the specified Component
     */
    function (ComposedComponent) {
      return (
        /**
         * A Component which manages a set of Queries and passes the output
         * of those queries into its child component.
         *
         * @class QueryContainer
         * @extends {react.Component}
         */
        function (_connectQueryParent) {
          _inherits(QueryContainer, _connectQueryParent);

          /**
           * Call getQueries to get our QueryBuilder instances, and populate
           * state with the Query Parameters and Query Results (initially results
           * are all [])
           *
           * @method constructor
           */
          function QueryContainer(props, context) {
            _classCallCheck(this, QueryContainer);

            var _this = _possibleConstructorReturn(this, (QueryContainer.__proto__ || Object.getPrototypeOf(QueryContainer)).call(this, props, context));

            _this._onQueryChange = function (queryName, newResults) {
              _this.setState({
                queryResults: _extends({}, _this.state.queryResults, _defineProperty({}, queryName, newResults))
              });
            };

            _this.state = {
              queryResults: _this.queryResults,
              queryParams: _this.queryParams
            };
            return _this;
          }

          /**
           * Any time the Query's data changes,
           * update this.state.queryResults[queryName]
           * with the new results.  Setting state will cause
           * the render method to pass the updated query data
           * to its ComposedComponent.
           *
           * @method _onQueryChange
           * @param  {string} queryName    - Name of the query (name comes from keys returned by getQueries())
           * @param  {Object[]} newResults - Array of query results
           */


          _createClass(QueryContainer, [{
            key: 'render',


            /**
             * Pass any properties provided to the QueryContainer
             * to its child container, along with the query results,
             * query parameters, and a setQueryParams function.
             *
             * @method render
             */
            value: function render() {
              var _this2 = this;

              var _state = this.state,
                  queryParams = _state.queryParams,
                  queryResults = _state.queryResults;


              var queryIds = {};
              Object.keys(this.queries).forEach(function (key) {
                queryIds[key] = _this2.queries[key].id;
              });

              var passedProps = _extends({}, queryResults, {
                query: {
                  queryParams: queryParams,
                  setQueryParams: this.setQueryParams,
                  queryIds: queryIds
                }
              });

              return _react2.default.createElement(ComposedComponent, _extends({}, this.props, passedProps));
            }
          }]);

          return QueryContainer;
        }((0, _connectQueryParent3.default)(getInitialQueryParams, getQueries))
      );
    }
  );
};