/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var TypeaheadOption = require('./option');
var classNames = require('classnames');

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = React.createClass({displayName: "TypeaheadSelector",
  propTypes: {
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    selectionIndex: React.PropTypes.number,
    onOptionSelected: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      selectionIndex: null,
      customClasses: {},
      customValue: null,
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    return {
      selectionIndex: this.props.selectionIndex,
      selection: this.getSelectionForIndex(this.props.selectionIndex)
    };
  },

  render: function() {
    var classes = {
      "typeahead-selector": true
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    var results = [];
    // CustomValue should be added to top of results list with different class name
    if (this.props.customValue !== null) {

      results.push(
        React.createElement(TypeaheadOption, {ref: this.props.customValue, key: this.props.customValue, 
          hover: this.state.selectionIndex === results.length, 
          customClasses: this.props.customClasses, 
          customValue: this.props.customValue, 
          onClick: this._onClick.bind(this, this.props.customValue)}, 
           this.props.customValue
        ));
    }

    this.props.options.forEach(function(result, i) {
      if (result.template) {
         results.push (
          React.createElement(TypeaheadOption, {ref: result, key: result.item, 
            hover: this.state.selectionIndex === results.length, 
            customClasses: this.props.customClasses, 
            onClick: this._onClick.bind(this, result.item), 
            onMouseOver: this._onMouseOver.bind(this, i), 
            onMouseOut: this._onMouseOut.bind(this, i)
            }, 
             result.template
          )
        );
      }
      else {
        results.push (
          React.createElement(TypeaheadOption, {ref: result, key: result, 
            hover: this.state.selectionIndex === results.length, 
            customClasses: this.props.customClasses, 
            onClick: this._onClick.bind(this, result), 
            onMouseOver: this._onMouseOver.bind(this, i), 
            onMouseOut: this._onMouseOut.bind(this, i)
            }, 
             result 
          )
        );
      }
    }, this);


    return React.createElement("ul", {className: classList},  results );
  },

  setSelectionIndex: function(index) {
    this.setState({
      selectionIndex: index,
      selection: this.getSelectionForIndex(index),
    });
  },

  getSelectionForIndex: function(index) {
    if (index === null) {
      return null;
    }
    if (index === 0 && this.props.customValue !== null) {
      return this.props.customValue;
    }

    if (this.props.customValue !== null) {
      index -= 1;
    }

    return this.props.options[index];
  },

  _onClick: function(result, event) {
    return this.props.onOptionSelected(result, event);
  },

  _nav: function(delta) {
    if (!this.props.options && this.props.customValue === null) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? (delta == 1 ? 0 : delta) : this.state.selectionIndex + delta;
    var length = this.props.options.length;
    if (this.props.customValue !== null) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    var newSelection = this.getSelectionForIndex(newIndex);
    this.setState({selectionIndex: newIndex,
                   selection: newSelection});
  },

  navDown: function() {
    this._nav(1);
  },

  navUp: function() {
    this._nav(-1);
  },

  _onMouseOver: function(index) {
    this.setState({
      selectionIndex: index
    });
  },

  _onMouseOut: function() {
    this.setState({
      selectionIndex: null
    });
  }

});

module.exports = TypeaheadSelector;