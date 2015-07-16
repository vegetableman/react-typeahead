/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = React.createClass({
  propTypes: {
    customClasses: React.PropTypes.object,
    customValue: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onMouse: React.PropTypes.func,
    children: React.PropTypes.any,
    hover: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      customClasses: {},
      onClick: function(event) {
        event.preventDefault();
      }
    };
  },

  getInitialState: function() {
    return {};
  },

  render: function() {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);
    return (
      <li className={classList}
        ref='option'
        onClick={this._onClick}
        onMouseOver={this._onMouseOver}
        onMouseOut={this._onMouseOut}>
        {this.props.children}
      </li>
    );
  },

  _getClasses: function() {
    var classes = {
      "typeahead-option": true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _getComputedStyle: function(el, prop) {
    return parseInt(window.getComputedStyle(el)[prop].replace('px', ''), 10);
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(this.props.hover) {
      var optionEl = this.refs.option.getDOMNode();
      var listEl = optionEl.parentNode;
      var elTop, elBottom, nodeScrollTop, nodeHeight;

      elTop = (optionEl.getBoundingClientRect().top + window.pageYOffset) - (listEl.getBoundingClientRect().top + window.pageYOffset);
      elBottom = elTop + optionEl.offsetHeight +
        this._getComputedStyle(optionEl, 'padding-top') +
        this._getComputedStyle(optionEl, 'padding-bottom');
      listScrollTop = listEl.scrollTop;
      listHeight = listEl.offsetHeight +
        this._getComputedStyle(listEl, 'padding-top') +
        this._getComputedStyle(listEl, 'padding-bottom')

      if (elTop < 0) {
        if(listEl.scrollTo)
          listEl.scrollTo(0, listScrollTop + elTop);
        else
          listEl.scrollTop = listScrollTop + elTop;
      }
      else if (listHeight < elBottom) {
        if(listEl.scrollTo)
          listEl.scrollTo(0, listScrollTop + (elBottom - listHeight));
        else
          listEl.scrollTop = listScrollTop + (elBottom - listHeight);
      }
    }
  },

  _onClick: function(event) {
    event.preventDefault();
    return this.props.onClick(event);
  },

  _onMouseOver: function(event) {
    event.preventDefault();
    return this.props.onMouseOver(event);
  },

  _onMouseOut: function(event) {
    event.preventDefault();
    return this.props.onMouseOut(event);
  }
});


module.exports = TypeaheadOption;