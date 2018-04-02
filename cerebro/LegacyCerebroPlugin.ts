import Cerebro from './Cerebro'
import CerebroPlugin from './CerebroPlugin'
import CerebroResult from './CerebroResult'
import CerebroUserAction, { Search } from './CerebroUserAction'

export default class LegacyCerebroPlugin extends CerebroPlugin {

  private actions:any

  constructor(id:string, keyword: string, private declaration: any) {
    super(id, keyword)
    this.actions = {}
  }

  onFocus(cerebro: Cerebro, focused: CerebroResult): void {
  }

  onSelect(cerebro: Cerebro, selected: CerebroResult): void {
  }

  onUserAction(cerebro: Cerebro, action: CerebroUserAction): void {
    if (action.intention instanceof Search) {
      if (this.declaration.fn) {
        //Scope
        // term, display, config, actions
        this.declaration.fn(
          {
            term: cerebro.term,
            config: cerebro.config,
            display: (results: any) => {
              if (results && results instanceof Array) {
                results
                  .map((result: any) => new CerebroResult(this, result.title, result.subtitle, '', result.icon))
                  .forEach(cerebro.addResults)
              } else if(results) {
                const result: any = results
                cerebro.addResults(new CerebroResult(this, result.title, result.subtitle, '', result.icon))
              }
            },
            actions: this.actions,
          },
        )
      }

    }
  }

  initializeAsync(cerebro: Cerebro): void {
    if (this.declaration.initializeAsync) {
      this.declaration.initializeAsync()
    }

    super.initializeAsync(cerebro)
  }
}
