import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { InputLabel } from 'material-ui'
import { FormControl, FormHelperText } from 'material-ui/Form'
import Hotkey from './Hotkey'
import countries from './countries'

import loadThemes from 'lib/loadThemes'

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
      openAtLogin: get('openAtLogin')
    }
    this.changeConfig = this.changeConfig.bind(this)
  }
  changeConfig(key, value) {
    this.props.set(key, value)
    this.setState({
      [key]: value
    })
  }
  render() {
    const { hotkey, showInTray, country, theme, developerMode, cleanOnHide, openAtLogin,
      trackingEnabled, crashreportingEnabled } = this.state

    return (

        <Hotkey
          hotkey={hotkey}
          helperText="Type your global shortcut for Cerebro in this input"
          label="Hotkey"
          onChange={key => this.changeConfig('hotkey', key)}
        />

    )
  }
}

Settings.propTypes = {
  get: PropTypes.func.isRequired,
  set: PropTypes.func.isRequired
}

export default Settings
