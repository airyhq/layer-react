import React from 'react';

import connectQueryParent from './connectQueryParent';

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
export default (getInitialQueryParams = {}, getQueries) =>
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
  (ComposedComponent) =>
    /**
     * A Component which manages a set of Queries and passes the output
     * of those queries into its child component.
     *
     * @class QueryContainer
     * @extends {react.Component}
     */
    class QueryContainer extends connectQueryParent(getInitialQueryParams, getQueries) {
      /**
       * Call getQueries to get our QueryBuilder instances, and populate
       * state with the Query Parameters and Query Results (initially results
       * are all [])
       *
       * @method constructor
       */
      constructor(props, context) {
        super(props, context);

        this.state = {
          queryResults: this.queryResults,
          queryParams: this.queryParams,
        };
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
      _onQueryChange = (queryName, newResults) => {
        this.setState({
          queryResults: {
            ...this.state.queryResults,
            [queryName]: newResults,
          },
        });
      }

      /**
       * Pass any properties provided to the QueryContainer
       * to its child container, along with the query results,
       * query parameters, and a setQueryParams function.
       *
       * @method render
       */
      render() {
        const { queryParams, queryResults } = this.state;

        const queryIds = {};
        Object.keys(this.queries).forEach((key) => {
          queryIds[key] = this.queries[key].id;
        });

        const passedProps = {
          ...queryResults,
          query: {
            queryParams,
            setQueryParams: this.setQueryParams,
            queryIds,
          },
        };

        return <ComposedComponent {...this.props} {...passedProps} />;
      }
    };
