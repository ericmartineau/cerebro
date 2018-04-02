import CerebroResult from './CerebroResult'

export default class CerebroUserAction {
  constructor(public intention: Intention) {
    // Detect what the user did and
  }
}

export type Navigation = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Intention {}

export class Search implements Intention {}

export class Close implements Intention {}

export class Open implements Intention {}

export class Navigate implements Intention {
  constructor(public navigation: Navigation) {
  }
}

export class Select implements Intention {
  constructor(public selected: CerebroResult) {
  }
}

