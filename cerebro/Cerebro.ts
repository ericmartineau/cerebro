import CerebroPlugin from './CerebroPlugin'
import CerebroResult from './CerebroResult'

export default class Cerebro {

  private _term: string
  private _focusedResult: CerebroResult
  private _results: Map<string, Array<CerebroResult>>
  private _config: Map<string, any>
  private _plugins: Map<string, CerebroPlugin>

  get results(): Map<string, Array<CerebroResult>> {
    return this._results
  }

  get config(): Map<string, any> {
    return this._config
  }

  get plugins(): Map<string, CerebroPlugin> {
    return this._plugins
  }

  constructor() {
    this._results = new Map<string, Array<CerebroResult>>()
    this._plugins = new Map<string, CerebroPlugin>()
  }

  public get term(): string {
    return this._term
  }

  public get focusedResult(): CerebroResult {
    return this._focusedResult
  }

  setTerm(value: string) {
    this._term = value
  }

  setFocusedResult(value: CerebroResult) {
    this._focusedResult = value
  }

  public registerPlugin(plugin: CerebroPlugin) {
    this._plugins.set(plugin.id, plugin)
  }

  public addResults(result: Result) {
    if (result && result instanceof Array) {
      result.forEach((r: CerebroResult) => {
        const category = r.category || 'Results'
        const categoryResults = this._results.get(category)
        if (categoryResults) {
          categoryResults.push(r)
        } else {
          this._results.set(category, [r])
        }
      })
    }
  }
}

export type Result = CerebroResult | Array<CerebroResult>
