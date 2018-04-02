import { focusableSelector } from 'cerebro-ui'
import SmartIcon from 'cerebro-ui/SmartIcon'
import { clipboard, remote } from 'electron'
import escapeStringRegexp from 'escape-string-regexp'
/* eslint default-case: 0 */
import key from 'keycode-js'

import getWindowPosition from 'lib/getWindowPosition'

import { trackEvent } from 'lib/trackEvent'
import debounce from 'lodash/debounce'

import {
  INPUT_HEIGHT,
  MIN_VISIBLE_RESULTS,
  RESULT_HEIGHT,
  WINDOW_WIDTH,
} from 'main/constants/ui'
// import SearchBar from 'material-ui-search-bar'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Input from 'material-ui/Input'
import { ListItemIcon, ListItemText } from 'material-ui/List'

import ListSubheader from 'material-ui/List/ListSubheader'
import { MenuItem, MenuList } from 'material-ui/Menu'
import { withStyles } from 'material-ui/styles'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as searchActions from '../../actions/search'
// import ResultsList from '../ResultsList'
import StatusBar from '../StatusBar'
// import Avatar from 'material-ui/Avatar'

// import styles from 'main/theme/selected'

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    background: theme.palette.background.paper,
  },
  mainInput: {
    fontSize: '40px',
    fontWeight: 300,
    fontFamily: 'Roboto Condensed',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: theme.searchBar.height,
  },
  drawerPaper: {
    position: 'relative',
    width: theme.resultList.width,
    paddingTop: theme.searchBar.height
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingTop: theme.searchBar.height
  },
})

const SHOW_EVENT = {
  category: 'Window',
  event: 'show',
}

const SELECT_EVENT = {
  category: 'Plugins',
  event: 'select',
}

const trackShowWindow = () => trackEvent(SHOW_EVENT)
const trackSelectItem = label => trackEvent({ ...SELECT_EVENT, label })

/**
 * Wrap click or mousedown event to custom `select-item` event,
 * that includes only information about clicked keys (alt, shift, ctrl and meta)
 *
 * @param  {Event} realEvent
 * @return {CustomEvent}
 */
const wrapEvent = (realEvent) => {
  const event = new CustomEvent('select-item', { cancelable: true })
  event.altKey = realEvent.altKey
  event.shiftKey = realEvent.shiftKey
  event.ctrlKey = realEvent.ctrlKey
  event.metaKey = realEvent.metaKey
  return event
}

/**
 * Set focus to first focusable element in preview
 */
const focusPreview = () => {
  const previewDom = document.getElementById('preview')
  const firstFocusable = previewDom.querySelector(focusableSelector)
  if (firstFocusable) {
    firstFocusable.focus()
  }
}

/**
 * Check if cursor in the end of input
 *
 * @param  {DOMElement} input
 */
const cursorInEndOfInput = ({ selectionStart, selectionEnd, value }) => (
  selectionStart === selectionEnd && selectionStart >= value.length
)

/**
 * Main search container
 *
 * TODO: Remove redux
 * TODO: Split to more components
 */
class Cerebro extends Component {
  constructor(props) {
    super(props)
    this.electronWindow = remote.getCurrentWindow()
    this.mainInput = null

    this.onWindowResize = debounce(this.onWindowResize, 100).bind(this)
    this.updateElectronWindow = debounce(this.updateElectronWindow, 16).bind(this)

    this.onDocumentKeydown = this.onDocumentKeydown.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onMainInputFocus = this.onMainInputFocus.bind(this)
    this.onMainInputBlur = this.onMainInputBlur.bind(this)
    this.cleanup = this.cleanup.bind(this)
    this.selectItem = this.selectItem.bind(this)

    // const debouncedUpdateTerm = debounce((newValue) => {
    //   console.log('Event', newValue)
    //   return this.props.actions.updateTerm(newValue)
    // }, 100)
    //
    // this.updateTerm = event => debouncedUpdateTerm(event.target.value)

    this.state = {
      mainInputFocused: false,
    }

    this.setInputRef = (el) => {
      console.log('Set ref', el)
      this.mainInput = el
    }

    this.focusMainInput = () => {
      if (this.mainInput) {
        this.mainInput.focus()
      }
    }

    // Listen for window.resize and change default space for results to user's
    // value
    window.addEventListener('resize', this.onWindowResize)
    // Add some global key handlers
    window.addEventListener('keydown', this.onDocumentKeydown)
    // Cleanup event listeners on unload
    // NOTE: when page refreshed (location.reload) componentWillUnmount is not
    // called
    window.addEventListener('beforeunload', this.cleanup)
    this.electronWindow.on('show', this.focusMainInput)
    this.electronWindow.on('show', this.updateElectronWindow)
    this.electronWindow.on('show', trackShowWindow)
  }

  componentDidMount() {
    this.focusMainInput()
    this.updateElectronWindow()
  }

  componentDidUpdate(prevProps) {
    const { results } = this.props
    if (results.length !== prevProps.results.length) {
      // Resize electron window when results count changed
      this.updateElectronWindow()
    }
  }

  componentWillUnmount() {
    this.cleanup()
  }

  /**
   * Handle resize window and change count of visible results depends on window
   * size
   */
  onWindowResize() {
    if (this.props.results.length <= MIN_VISIBLE_RESULTS) {
      return false
    }
    let visibleResults = Math.floor((window.outerHeight - INPUT_HEIGHT)
      / RESULT_HEIGHT)
    visibleResults = Math.max(MIN_VISIBLE_RESULTS, visibleResults)
    if (visibleResults !== this.props.visibleResults) {
      this.props.actions.changeVisibleResults(visibleResults)
    }
  }

  onDocumentKeydown(event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      this.focusMainInput()
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyDown(event) {
    const highlighted = this.highlightedResult()
    // TODO: go to first result on cmd+up and last result on cmd+down
    if (highlighted && highlighted.onKeyDown) {
      highlighted.onKeyDown(event)
    }
    if (event.defaultPrevented) {
      return
    }

    const keyActions = {
      select: () => {
        this.selectCurrent(event)
      },
      arrowRight: () => {
        if (cursorInEndOfInput(event.target)) {
          if (this.autocompleteValue()) {
            // Autocomplete by arrow right only if autocomple value is shown
            this.autocomplete(event)
          } else {
            focusPreview()
            event.preventDefault()
          }
        }
      },
      arrowDown: () => {
        this.props.actions.moveCursor(1)
        event.preventDefault()
      },
      arrowUp: () => {
        if (this.props.results.length > 0) {
          this.props.actions.moveCursor(-1)
        } else if (this.props.prevTerm) {
          this.props.actions.updateTerm(this.props.prevTerm)
        }
        event.preventDefault()
      },
    }

    if (event.metaKey || event.ctrlKey) {
      if (event.keyCode === 67) {
        // Copy to clipboard on cmd+c
        const text = this.highlightedResult().clipboard
        if (text) {
          clipboard.writeText(text)
          this.props.actions.reset()
          event.preventDefault()
        }
        return
      }
      if (event.keyCode >= key.KEY_1 && event.keyCode <= key.KEY_9) {
        // Select element by number
        const number = Math.abs(key.KEY_1 - event.keyCode)
        const selectedIndex = this.props.results[number]
        if (selectedIndex) {
          return this.selectItem(selectedIndex)
        }
      }
      // Lightweight vim-mode: cmd/ctrl + jklo
      switch (event.keyCode) {
        case key.KEY_J:
          keyActions.arrowDown()
          break
        case key.KEY_K:
          keyActions.arrowUp()
          break
        case key.KEY_L:
          keyActions.arrowRight()
          break
        case key.KEY_O:
          keyActions.select()
          break
      }
    }
    switch (event.keyCode) {
      case key.KEY_TAB:
        this.autocomplete(event)
        break
      case key.KEY_RIGHT:
        keyActions.arrowRight()
        break
      case key.KEY_DOWN:
        keyActions.arrowDown()
        break
      case key.KEY_UP:
        keyActions.arrowUp()
        break
      case key.KEY_RETURN:
        keyActions.select()
        break
      case key.KEY_ESCAPE:
        this.props.actions.reset()
        this.electronWindow.hide()
        break
    }
  }

  onMainInputFocus() {
    this.setState({ mainInputFocused: true })
  }

  onMainInputBlur() {
    this.setState({ mainInputFocused: false })
  }

  cleanup() {
    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('keydown', this.onDocumentKeydown)
    window.removeEventListener('beforeunload', this.cleanup)
    this.electronWindow.removeListener('show', this.focusMainInput)
    this.electronWindow.removeListener('show', this.updateElectronWindow)
    this.electronWindow.removeListener('show', trackShowWindow)
  }

  /**
   * Get highlighted result
   * @return {Object}
   */
  highlightedResult() {
    return this.props.results[this.props.selected]
  }

  /**
   * Select item from results list
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  selectItem(item, realEvent) {
    this.props.actions.reset()
    trackSelectItem(item.plugin)
    const event = wrapEvent(realEvent)
    if (!event.defaultPrevented) {
      this.electronWindow.hide()
    }
    item.onSelect(event)
  }

  /**
   * Autocomple search term from highlighted result
   */
  autocomplete(event) {
    const { term } = this.highlightedResult()
    if (term && term !== this.props.term) {
      this.props.actions.updateTerm(term)
      event.preventDefault()
    }
  }

  /**
   * Select highlighted element
   */
  selectCurrent(event) {
    this.selectItem(this.highlightedResult(), event)
  }

  /**
   * Set resizable and size for main electron window when results count is
   * changed
   */
  updateElectronWindow() {
    const { results, visibleResults } = this.props
    const { length } = results
    const win = this.electronWindow
    const [width] = win.getSize()

    // When results list is empty window is not resizable
    win.setResizable(length !== 0)

    if (length === 0) {
      win.setMinimumSize(WINDOW_WIDTH, INPUT_HEIGHT)
      win.setSize(width, INPUT_HEIGHT)
      win.setPosition(...getWindowPosition({ width }))
      return
    }

    const resultHeight = Math.max(Math.min(visibleResults, length),
      MIN_VISIBLE_RESULTS)
    const heightWithResults = resultHeight * RESULT_HEIGHT + INPUT_HEIGHT
    const minHeightWithResults = MIN_VISIBLE_RESULTS * RESULT_HEIGHT
      + INPUT_HEIGHT
    win.setMinimumSize(WINDOW_WIDTH, minHeightWithResults)
    win.setSize(width, heightWithResults)
    win.setPosition(...getWindowPosition({ width, heightWithResults }))
  }

  autocompleteValue() {
    const selected = this.highlightedResult()
    if (selected && selected.term) {
      const regexp = new RegExp(`^${escapeStringRegexp(this.props.term)}`, 'i')
      if (selected.term.match(regexp)) {
        return selected.term.replace(regexp, this.props.term)
      }
    }
    return ''
  }

  /**
   * Render autocomplete suggestion from selected item
   * @return {React}
   */
  renderAutocomplete() {
    const term = this.autocompleteValue()
    if (term) {
      return <div className={this.props.classes.autocomplete}>{term}</div>
    }
  }

  render() {
    const { mainInputFocused } = this.state
    const { classes } = this.props

    return (
      <div className={classes.root}>
        {this.renderAutocomplete()}
        <AppBar color="default" position="absolute"
          className={classes.appBar}>
          <Toolbar color="inherit">
            <Input autoFocus
              fullWidth
              inputRef={this.setInputRef}
              onChange={e => this.props.actions.updateTerm(
                e.target.value)}
              placeholder="Cerebro Search"
              className={classes.mainInput}
              value={this.props.term}
              onBlur={this.onMainInputBlur}
              onKeyDown={this.onKeyDown}
              onFocus={this.onMainInputFocus}
              color="inherit"
              disableUnderline
            />
          </Toolbar>
        </AppBar>
        <Drawer
            variant="permanent"
            classes={{
              paper: classes.drawerPaper
            }}
          >
          <div className={classes.toolbar} />
          <MenuList
            ref="list"
            dense
            className={classes.list}
            subheader={<ListSubheader
              component="div">Results</ListSubheader>}
          >
            {this.props.results.map(item => (
              <MenuItem
                className={classes.menuItem}
                button
                onSelect={this.selectItem}
                key={item.id}
              >
                {item.icon &&
                <ListItemIcon className={classes.icon}>
                  <SmartIcon path={item.icon} />
                </ListItemIcon>
                }
                <ListItemText
                  inset
                  classes={{ primary: classes.primary }}
                  primary={item.title}
                  secondary={item.description}
                />
              </MenuItem>
            ))}
          </MenuList>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.props.results.length > 0
          && this.renderPreview()}

          {this.props.results.length === 0
          && <Typography><h3>Select a result</h3></Typography>}
        </main>
        {this.props.statusBarText
        && <StatusBar value={this.props.statusBarText} />}
      </div>
    )
  }

  renderPreview() {
    const selected = this.props.results[this.props.selected]
    if (!selected.getPreview) {
      return null
    }
    const preview = selected.getPreview()
    if (typeof preview === 'string') {
      // Fallback for html previews intead of react component
      return <div dangerouslySetInnerHTML={{ __html: preview }} />
    }
    return preview
  }
}

//
// <div className={classes.results}>
//   <ResultsList
//     results={this.props.results}
//     selected={this.props.selected}
//     visibleResults={this.props.visibleResults}
//
//     onSelect={this.selectItem}
//     mainInputFocused={mainInputFocused}
//   />
//
// </div>
Cerebro.propTypes = {
  actions: PropTypes.shape(
    {
      reset: PropTypes.func,
      moveCursor: PropTypes.func,
      updateTerm: PropTypes.func,
      changeVisibleResults: PropTypes.func,
      selectElement: PropTypes.func,
    }),
  classes: PropTypes.object.isRequired,
  results: PropTypes.array,
  selected: PropTypes.number,
  visibleResults: PropTypes.number,
  term: PropTypes.string,
  statusBarText: PropTypes.string,
  prevTerm: PropTypes.string,
}

function mapStateToProps(state) {
  return {
    selected: state.search.selected,
    results: state.search.resultIds.map(id => state.search.resultsById[id]),
    term: state.search.term,
    statusBarText: state.statusBar.text,
    prevTerm: state.search.prevTerm,
    visibleResults: state.search.visibleResults,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(searchActions, dispatch),
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Cerebro))
