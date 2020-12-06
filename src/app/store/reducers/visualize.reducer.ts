import * as VisualizeActions from './../actions/visualize.actions';
import { Node } from './../../models/node.model';

export interface State {
    startNode: Node;
    endNode: Node;
    algorithm: string;
    speed: number;
    visualizeStarted: boolean;
}

const initialState: State = {
    startNode: null,
    endNode: null,
    algorithm: null,
    speed: null,
    visualizeStarted: false
}

export function reducer(state = initialState, action: VisualizeActions.VisualizeAction): any {
    switch (action.type) {
        case VisualizeActions.INITIALIZE_START_END:
            return {
                ...state,
                startNode: action.payload.startNode,
                endNode: action.payload.endNode
            };
        case VisualizeActions.VISUALIZE_START:
            return {
                ...state,
                algorithm: action.payload.algo,
                speed: action.payload.speed,
                visualizeStarted: true
            };
        case VisualizeActions.VISUALIZE_END:
            return {
                ...state,
                algorithm: null,
                speed: null,
                visualizeStarted: false
            };
        default:
            return state;
    }
}