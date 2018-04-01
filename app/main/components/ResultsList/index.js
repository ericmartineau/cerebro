import SmartIcon from 'cerebro-ui/SmartIcon'
import Avatar from 'material-ui/Avatar'
import Grid from 'material-ui/Grid'
import List, { ListItem, ListItemText } from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import { withStyles } from 'material-ui/styles'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from 'main/theme/selected'

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

  render() {
    const { classes, results, selected, visibleResults, mainInputFocused } = this.props
    if (results.length === 0) {
      return null
    }
    return (
      <Grid container>
        <Grid item xs={12} sm={4} lg={2}>
          <List
            ref="list"
            component="nav"
            dense
            className={classes.resultList}
            subheader={<ListSubheader component="div">Results</ListSubheader>}
          >
            {this.props.results.map(item => (
              <ListItem button key={item.id} selected className={classes.resultItem}>
                {item.icon &&
                <Avatar className={classes.resultIcon}>
                  <SmartIcon path={item.icon} className={styles.icon} />
                </Avatar>
                }
                <ListItemText
                  className={classes.resultText}
                  primary={item.title}
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>

        </Grid>
        <Grid item xs={12} sm={8} lg={10}>
          <div className={classes.resultPreview}>
            {this.renderPreview()}
          </div>
        </Grid>
      </Grid>
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

export default withStyles(styles)(ResultsList)
