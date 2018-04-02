import Cerebro from './Cerebro'
import CerebroResult from './CerebroResult'
import CerebroUserAction from './CerebroUserAction'

export default abstract class CerebroPlugin {

  public pluginVersion = "1.2.0"

  constructor(public id: string, public keyword:string) {
  }

  abstract onUserAction(cerebro:Cerebro, action:CerebroUserAction):void
  abstract onFocus(cerebro:Cerebro, focused: CerebroResult):void
  abstract onSelect(cerebro:Cerebro, selected: CerebroResult):void
  initializeAsync(cerebro:Cerebro):void {
    // Nothing to do by default
  }
}
