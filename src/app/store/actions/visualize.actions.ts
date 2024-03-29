import { Action } from '@ngrx/store';
import { Node } from 'src/app/models/node.model';

export const INITIALIZE_START_END = '[Visualize] Initialize Start - End Node';
export const VISUALIZE_START = '[Visualize] Visualize Start';
export const VISUALIZE_END = '[Visualize] Visualize End';
export const ALGORITM_CHANGED = '[VIsualize] Algoritm Changed';

export class InitializeStartEndAction implements Action {
  readonly type = INITIALIZE_START_END;

  constructor(public payload: { startNode: Node; endNode: Node }) {}
}

export class VisualizeStartAction implements Action {
  readonly type = VISUALIZE_START;

  constructor(public payload: { algo: string; speed: number }) {}
}

export class VisualizeEndAction implements Action {
  readonly type = VISUALIZE_END;
}

export class AlgoritmChangedAction implements Action {
  readonly type = ALGORITM_CHANGED;

  constructor(public payload: string) {}
}

export type VisualizeAction =
  | VisualizeStartAction
  | InitializeStartEndAction
  | VisualizeEndAction
  | AlgoritmChangedAction
  ;

