import { withStyles } from 'material-ui/styles'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Typography from 'material-ui/Typography'
import Drawer from 'material-ui/Drawer'
import { ListItemIcon, ListItemText } from 'material-ui/List'
import { MenuItem, MenuList } from 'material-ui/Menu'

import ListSubheader from 'material-ui/List/ListSubheader'


const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    width: theme.resultList.width,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
})

// import Row from './Row'

// const styles = theme => ({
//   root: {
//     flexGrow: 1,
//     backgroundColor: theme.palette.background.paper,
//   },
//   listSection: {
//     minWidth: 0,
//   },
//   resultsList: {
//     borderRight: theme.palette.divider.default,
//     backgroundColor: theme.palette.background.paper,
//     overflow: 'auto',
//     maxHeight: '100%',
//   },
//   preview: {
//     padding: theme.spacing.unit * 3,
//     minWidth: 0, // So the Typography noWrap works
//     backgroundColor: theme.palette.background.paper,
//   },
// })

class ResultsList extends Component {
  constructor(props) {
    super(props)
    this.rowRenderer = this.rowRenderer.bind(this)
  }

  rowRenderer({ index }) {
    const result = this.props.results[index]
    const attrs = {
      ...result,
      // TODO: think about events
      // In some cases action should be executed and window should be closed
      // In some cases we should autocomplete value
      selected: index === this.props.selected,
      onSelect: event => this.props.onSelect(result, event),
      // Move selection to item under cursor
      onMouseMove: (event) => {
        const { selected, mainInputFocused, onItemHover } = this.props
        const { movementX, movementY } = event.nativeEvent
        if (index === selected || !mainInputFocused) {
          return false
        }
        if (movementX || movementY) {
          // Hover item only when we had real movement of mouse
          // We should prevent changing of selection when user uses keyboard
          onItemHover(index)
        }
      },
      key: result.id,
    }
    // return <Row {...attrs} />
    return null
  }



  render() {
    const { classes, results, selected, visibleResults, mainInputFocused } = this.props
    if (results.length === 0) {
      return null
    }
    return (
      <div className={classes.root}>

      </div>

    )
  }
}

ResultsList.propTypes = {
  classes: PropTypes.object.isRequired,
  results: PropTypes.array,
  selected: PropTypes.number,
  visibleResults: PropTypes.number,
  onItemHover: PropTypes.func,
  onSelect: PropTypes.func,
  mainInputFocused: PropTypes.bool,
}

export default withStyles({})(ResultsList)
