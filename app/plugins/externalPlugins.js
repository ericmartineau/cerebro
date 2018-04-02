import LegacyCerebroPlugin from '../../cerebro/LegacyCerebroPlugin'
import chokidar from 'chokidar'
import { initializePlugin } from 'lib/initializePlugins'
import { ensureFiles, modulesDirectory, settings } from 'lib/plugins'
import debounce from 'lodash/debounce'
import path from 'path'

const requirePlugin = (base, pluginPath) => {
  try {
    const required = window.require(pluginPath)
    let plugin
    // Fallback for plugins with structure like `{default: {fn: ...}}`
    const keys = Object.keys(required)
    if (required.pluginVersion) { // Declared using the versioned module
      plugin = required
    } else {
      const pluginDecl = (keys.length === 1 && keys[0] === 'default') ?
                         required.default : require
      plugin = new LegacyCerebroPlugin(base, '', pluginDecl)
    }
    return plugin
  } catch (error) {
    // catch all errors from plugin loading
    console.log('Error requiring', pluginPath)
    console.log(error)
  }
}

/**
 * Validate plugin module signature
 *
 * @param  {Object} plugin
 * @return {Boolean}
 */
const isPluginValid = (plugin) => (
  plugin &&
  // Check existing of main plugin function
  typeof plugin.fn === 'function' &&
  // Check that plugin function accepts 0 or 1 argument
  plugin.fn.length <= 1
)

ensureFiles()

const plugins = {}

const pluginsWatcher = chokidar.watch(modulesDirectory, { depth: 0 })

pluginsWatcher.on('unlinkDir', (pluginPath) => {
  const { base, dir } = path.parse(pluginPath)
  if (dir !== modulesDirectory) {
    return
  }
  const requirePath = window.require.resolve(pluginPath)
  delete plugins[base]
  delete window.require.cache[requirePath]
  console.log(`[${base}] Plugin removed`)
})

pluginsWatcher.on('addDir', (pluginPath) => {
  const { base, dir } = path.parse(pluginPath)
  if (dir !== modulesDirectory) {
    return
  }
  setTimeout(() => {
    console.group(`Load plugin: ${base}`)
    console.log(`Path: ${pluginPath}...`)
    const plugin = requirePlugin(base, pluginPath)
    if (!isPluginValid(plugin)) {
      console.log('Plugin is not valid, skipped')
      console.groupEnd()
      return
    }
    if (!settings.validate(plugin)) {
      console.log('Invalid plugins settings')
      console.groupEnd()
      return
    }

    console.log('Loaded.')
    const requirePath = window.require.resolve(pluginPath)
    const watcher = chokidar.watch(pluginPath, { depth: 0 })
    watcher.on('change', debounce(() => {
      console.log(`[${base}] Update plugin`)
      delete window.require.cache[requirePath]
      plugins[plugin.id] = requirePlugin(base, pluginPath)
      console.log(`[${base}] Plugin updated`)
    }, 1000))
    plugins[base] = plugin
    if (!global.isBackground) {
      console.log('Initialize async plugin', base)
      initializePlugin(base)
    }
    console.groupEnd()
  }, 1000)
})

export default plugins
