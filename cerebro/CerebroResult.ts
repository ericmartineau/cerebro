import CerebroPlugin from './CerebroPlugin'

export default class CerebroResult {
  constructor(
    public plugin:CerebroPlugin,
    public title:string,
    public subtitle?:string,
    public category?:string,
    public icon?:Icon) {
  }
}

type Icon = string | CerebroIcon

export class CerebroIcon {
}


