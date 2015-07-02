/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    customClasses: React.PropTypes.object,
    maxVisible: React.PropTypes.number,
    options: React.PropTypes.array,
    allowCustomValues: React.PropTypes.number,
    defaultValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    noFilter: React.PropTypes.bool,
    onEmptyFocus: React.PropTypes.func,
    onChange: React.PropTypes.func,
    disabled: React.PropTypes.any
  },

  getDefaultProps: function() {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      defaultValue: "",
      placeholder: "",
      onEmptyFocus: null,
      noFilter: false,
      onKeyDown: function(event) { return },
      onOptionSelected: function(option) { }
    };
  },

  getInitialState: function() {
    return {
      // The currently visible set of options
      visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null,

      showLoader: false,

      customValue: null
    };
  },

  getOptionsForValue: function(value, options) {
    var result;

    if (this.props.noFilter) {
      result = options;
    }
    else {
      result = fuzzy.filter(value, options).map(function(res) {
        return res.string;
      });
    }

    if(!result) {
      result = [];
    }

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  },

  setEntryText: function(value) {
    this.refs.entry.getDOMNode().value = value;
    this._onTextEntryUpdated();
  },

  _hasCustomValue: function() {
    if (this.props.allowCustomValues > 0 &&
      this.state.entryValue.length >= this.props.allowCustomValues &&
      this.state.visible.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function() {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null
  },

  _renderIncrementalSearchResults: function() {
    // Nothing has been entered into the textbox
    if (!this.state.entryValue  && !this.state.emptyFocus) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    // There are no typeahead / autocomplete suggestions
    if (!this.state.visible.length && !(this.props.allowCustomValues > 0)) {
      return "";
    }

    if (this._hasCustomValue()) {
      return (
        <TypeaheadSelector
          ref="sel" options={this.state.visible}
          customValue={this.state.entryValue}
          onOptionSelected={this._onOptionSelected}
          customClasses={this.props.customClasses} />
      );
    }

    return (
      <TypeaheadSelector
        ref="sel" options={ this.state.visible }
        onOptionSelected={ this._onOptionSelected }
        customClasses={this.props.customClasses} />
   );
  },

  _onOptionSelected: function(option, event) {
    var nEntry = this.refs.entry.getDOMNode();
    var item = option.template ? option.item : option;
    nEntry.focus();
    nEntry.value = option.text ? option.text: item;
    this.setState({visible: this.getOptionsForValue(option, this.props.options),
                   selection: option,
                   entryValue: nEntry.value,
                   showLoader: false});
    return this.props.onOptionSelected(item, event);
  },

  _onTextEntryUpdated: function() {
    var value = this.refs.entry.getDOMNode().value;
    this.props.onChange(value);
    this.setState({visible: this.getOptionsForValue(value, this.props.options),
                   selection: null,
                   emptyFocus: false,
                   entryValue: value,
                   showLoader: true
                 });
  },

  _onTextEntryFocus: function() {
    var value = this.refs.entry.getDOMNode().value;
    if(!value.length && this.props.onEmptyFocus) {
      if (this.state.visible && this.state.visible.length) {
        return;
      }
      else {
        this.props.onEmptyFocus(value);
        this.setState({emptyFocus: true, showLoader: true});
      }
    }
  },

  _onEnter: function(event) {
    if (!this.refs.sel.state.selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(this.refs.sel.state.selection, event);
  },

  _onEscape: function() {
    this.refs.sel.setSelectionIndex(null)
  },

  _onTab: function(event) {
    var option = this.refs.sel.state.selection ?
      this.refs.sel.state.selection : (this.state.visible.length > 0 ? this.state.visible[0] : null);

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _onKeyDown: function(event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function(nextProps) {
     if(nextProps.reset) {
      this.setState({
        visible: this.getOptionsForValue(this.state.entryValue, nextProps.options),
        showLoader: !nextProps.options,
        entryValue: ''
      });
    }
    else if (nextProps.revert) {
      this.setState({
        visible: this.getOptionsForValue(this.state.entryValue, nextProps.options),
        showLoader: !nextProps.options,
        entryValue: this.state.entryValue || nextProps.defaultValue
      });
    }
    else {
      this.setState({
        visible: this.getOptionsForValue(this.state.entryValue, nextProps.options),
        showLoader: !nextProps.options
      });
    }
  },

  render: function() {
    var inputClasses = {}
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: true
    }
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    return (
      <div className={classList}>
        { this._renderHiddenInput() }
        <input ref="entry" type="text"
          placeholder={this.props.placeholder}
          className={inputClassList}
          value={this.state.customValue != undefined ? this.state.customValue: this.state.entryValue}
          defaultValue={this.props.defaultValue}
          disabled={this.props.disabled}
          onFocus={this._onTextEntryFocus}
          onChange={this._onTextEntryUpdated} onKeyDown={this._onKeyDown} />
        { this._renderLoader() }
        { this._renderIncrementalSearchResults() }
      </div>
    );
  },

  _renderLoader: function() {
    if (this.state.showLoader && (this.state.entryValue.length || this.state.emptyFocus)) {
      return this.props.loader;
    }
    else {
      return null;
    }
  },

  _renderHiddenInput: function() {
    if (!this.props.name) {
      return null;
    }

    return (
      <input
        type="hidden"
        name={ this.props.name }
        value={ this.state.selection }
      />
    );
  }
});

module.exports = Typeahead;