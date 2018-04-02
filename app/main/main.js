import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'

import initializePlugins from 'lib/initializePlugins'
import { on } from '../lib/rpc'
import { updateTerm } from './actions/search'
import store from './store'
import Cerebro from './components/Cerebro'

require('fix-path')()

global.React = React
global.ReactDOM = ReactDOM
global.isBackground = false

/**
 * Change current theme
 *
 * @param  {String} src Absolute path to new theme css file
 */
const changeTheme = (src) => {
  document.getElementById('cerebro-theme').href = src
}

const defaultTheme = createMuiTheme(
  {
    palette: {
      primary: {
        light: '#80D8FF',
        main: '#0288D1',
        dark: '#01579B',
        contrastText: '#fff',
      },
      secondary: {
        light: '#FFF8E1',
        main: '#ffd54f',
        dark: '#E65100',
        contrastText: '#000',
      },
      type: 'dark',
    },

    typography: {
      fontFamily: 'Roboto',
      fontWeight: 'light',
    },

    searchBar: {
      height: 70,
    },
    resultList: {
      width: 250,
    },
  })

// Set theme from config
// const themeName = config.get('theme')
// if (themeName) {
//   styles = require(themeName)
// } else {
//   styles = require("main/themes/light")
// }
//
// changeTheme()

// Render main container
ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={defaultTheme}>
      <Cerebro />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root'),
)

// Initialize plugins
initializePlugins()

// Handle `showTerm` rpc event and replace search term with payload
on('showTerm', term => store.dispatch(updateTerm(term)))

on('update-downloaded', () => (
  new Notification('Cerebro: update is ready to install', {
    body: 'New version is downloaded and will be automatically installed on quit',
  })
))

// Handle `updateTheme` rpc event and change current theme
on('updateTheme', changeTheme)

// Handle `reload` rpc event and reload window
on('reload', () => location.reload())
