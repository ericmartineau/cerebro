import React, { Component, PropTypes } from 'react'
import styles from './styles.css'
import SearchBar from 'material-ui-search-bar'

class MainInput extends Component {

  render() {
    return (
      <SearchBar
        placeholder="Cerebro Search"
        id="main-input"
        inputRef={this.props.inputRef}
        value={this.props.value}
        onRequestSearch={this.props.onChange}
        className={styles.input}
        onBlur={this.props.onBlur}
        onKeyDown={this.props.onKeyDown}
        onChange={this.props.onChange}
        onFocus={this.props.onFocus}
      />
    )
  }
}

MainInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onKeyDown: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  inputRef: PropTypes.func,
}

export default MainInput
