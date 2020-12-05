import { ActionReducerMap } from '@ngrx/store';
import * as fromVisualize from './reducers/visualize.reducer';

export interface AppState {
    visualizeData: fromVisualize.State;
}

export const reducers: ActionReducerMap<AppState> = {
    visualizeData: fromVisualize.reducer
}