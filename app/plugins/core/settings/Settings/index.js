import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import { withStyles } from 'material-ui/styles'
import Hotkey from './Hotkey'
import Typography from 'material-ui/Typography'
import countries from './countries'
import { MenuItem } from 'material-ui/Menu'
import TextField from 'material-ui/TextField'

const styles = theme => ({
  root: theme.mixins.gutters(
    {
      paddingBottom: 16,
      marginTop: theme.spacing.unit * 3,
    }),
  form: theme.mixins.gutters(
    {
      paddingTop: 16,
      paddingBottom: 16,
      marginTop: theme.spacing.unit * 3,
    })
})

class Settings extends Component {
  constructor(props) {
    super(props)
    const { get } = this.props
    this.state = {
      hotkey: get('hotkey'),
      showInTray: get('showInTray'),
      country: get('country'),
      theme: get('theme'),
      developerMode: get('developerMode'),
      cleanOnHide: get('cleanOnHide'),
      pluginsSettings: get('plugins'),
      trackingEnabled: get('trackingEnabled'),
      crashreportingEnabled: get('crashreportingEnabled'),
      openAtLogin: get('openAtLogin'),
    }
    this.changeConfig = this.changeConfig.bind(this)
  }

  changeConfig(key, value) {
    this.props.set(key, value)
    this.setState({
                    [key]: value,
                  })
  }

  render() {
    const {
      hotkey, showInTray, country, theme, developerMode, cleanOnHide, openAtLogin,
      trackingEnabled, crashreportingEnabled,
    } = this.state

    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Typography variant="headline">Cerebro Settings</Typography>
        <Paper classes={{root: classes.form}}>
          <Hotkey
            hotkey={hotkey}
            helperText="Type your global shortcut for Cerebro in this input"
            label="Hotkey"
            onChange={key => this.changeConfig('hotkey', key)}
          />
          <TextField
            id="country"
            select
            label="Country"
            className={classes.textField}
            value={country}
            onChange={value => this.changeConfig('country', value)}
            SelectProps={{
              MenuProps: {
                className: classes.menu,
              },
            }}
            helperText="Choose your country so Cerebro can better choose currency, language, etc."
            margin="normal"
          >
            {countries.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Paper>
      </div>


      //  <Select
      // label="Theme" value={theme} options={loadThemes()} onChange={value =>
      // this.changeConfig('theme', value)} /> <Checkbox label="Open at login"
      // value={openAtLogin} onChange={value =>
      // this.changeConfig('openAtLogin', value)} /> <Checkbox label="Show in
      // menu bar" value={showInTray} onChange={value =>
      // this.changeConfig('showInTray', value)} /> <Checkbox label="Developer
      // Mode" value={developerMode} onChange={value =>
      // this.changeConfig('developerMode', value)} /> <Checkbox label="Clean
      // results on hide" value={cleanOnHide} onChange={value =>
      // this.changeConfig('cleanOnHide', value)} /> <Checkbox label="Send
      // anonymous statistics (requires restart)" value={trackingEnabled}
      // onChange={value => this.changeConfig('trackingEnabled', value)} />
      // <Checkbox label="Send automatic crash reports (requires restart)"
      // value={crashreportingEnabled} onChange={value =>
      // this.changeConfig('crashreportingEnabled', value)} />
    )
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  get: PropTypes.func.isRequired,
  set: PropTypes.func.isRequired,
}

export default withStyles(styles)(Settings)
