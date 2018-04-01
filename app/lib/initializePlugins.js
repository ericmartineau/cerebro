import { on, send } from './rpc'
import allPlugins from '../plugins'
import pluginSettings from './plugins/settings'

export const initializePlugin = (name) => {
  const { initialize, initializeAsync } = allPlugins[name]
  if (initialize) {
    // Foreground plugin initialization
    try {
      initialize(pluginSettings.getUserSettings(name))
    } catch (e) {
      console.error(`Failed to initialize plugin: ${name}`, e)
    }
  }

  if (initializeAsync) {
    // Background plugin initialization
    send('initializePluginAsync', { name })
  }
}

/**
 * RPC-call for plugins initializations
 */
export default () => {
  // Start listening for replies from plugin async initializers
  on('plugin.message', ({ name, data }) => {
    const plugin = allPlugins[name]
    if (plugin.onMessage) plugin.onMessage(data)
  })

  Object.keys(allPlugins).forEach(initializePlugin)
}
