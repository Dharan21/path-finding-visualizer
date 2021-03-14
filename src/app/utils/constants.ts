import * as Enums from './enums';

export const PathFindingAlgoDropdown: string[] = [
    Enums.PathFindingAlgorithms.BFS,
    Enums.PathFindingAlgorithms.DFS,
    Enums.PathFindingAlgorithms.Dijkstra,
    Enums.PathFindingAlgorithms.AStar
];

export const SpeedDropdown: { option: string, value: number }[] = [
    { option: 'Slow', value: 200 },
    { option: 'Medium', value: 50 },
    { option: 'Fast', value: 10 }
];