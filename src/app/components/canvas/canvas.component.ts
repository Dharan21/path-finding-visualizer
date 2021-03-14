import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragStart,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Node } from './../../models/node.model';
import * as fromVisualizeActions from './../../store/actions/visualize.actions';
import * as VisualizeReducer from './../..//store/reducers/visualize.reducer';
import * as fromApp from './../../store/app.reducers';
import * as Enums from './../../utils/enums';

@Component({
  selector: 'app-canvas',
  templateUrl: 'canvas.component.html',
  styleUrls: ['canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  startNode: Node;
  endNode: Node;
  //   rowCount = 14;
  rowCount = 7;
  colCount = 25;
  rowsArray: number[];
  colsArray: number[];
  weights: number[][];
  connectedDropListArray: string[][] = [];
  arrayIndexes: number[][] = [];
  windowsWidth: number;
  delay = 0;
  speed = 20;
  sortestPath: Node[] = [];
  blocks: Node[] = [];
  isRunning = false;
  isCompletedOnce = false;
  currentAlgo: string;
  isAlgorithmForWeightedGraph = false;

  constructor(private store: Store<fromApp.AppState>) {
    this.rowsArray = Array(this.rowCount);
    this.colsArray = Array(this.colCount);
  }

  ngOnInit(): void {
    this.store
      .select('visualizeData')
      .subscribe((data: VisualizeReducer.State) => {
        if (!this.startNode && !this.endNode) {
          this.startNode = data.startNode;
          this.endNode = data.endNode;
        } else if (data.algorithm) {
          this.currentAlgo = data.algorithm;
          this.isAlgorithmForWeightedGraph = this.isWeighted();
          if (data.visualizeStarted) {
            this.speed = data.speed;
            this.visualize(data.algorithm);
          }
        }
        this.isRunning = data.visualizeStarted;
      });
    this.colCount = Math.floor((window.innerWidth - 10) / 30);
    this.colCount = Math.floor(this.colCount / 2);
    this.colsArray = Array(this.colCount);
    this.weights = [];
    for (let i = 0; i < this.rowCount; i++) {
      const list = [];
      for (let j = 0; j < this.colCount; j++) {
        list.push([this.random(10, 1), this.random(10, 1)]);
      }
      this.weights.push(list);
    }
    // console.log(this.weights);
    this.initialize();
  }

  isWeighted(): boolean {
    switch (this.currentAlgo) {
      case Enums.PathFindingAlgorithms.Dijkstra:
        return true;
      default:
        return false;
    }
  }

  visualize(algo: string, withTimeout: boolean = true): void {
    switch (algo) {
      case Enums.PathFindingAlgorithms.DFS:
        this.DFS(withTimeout);
        break;
      case Enums.PathFindingAlgorithms.BFS:
        this.BFS(withTimeout);
        break;
      case Enums.PathFindingAlgorithms.Dijkstra:
        this.dijkstra(withTimeout);
        break;
      case Enums.PathFindingAlgorithms.AStar:
        this.aStar(withTimeout);
        break;
    }
  }

  cleanEnv(): void {
    this.delay = 0;
    const boxes: HTMLCollectionOf<Element> = document.getElementsByClassName(
      'innerBox'
    );
    for (let i = 0; i < boxes.length; i++) {
      boxes.item(i).classList.remove(Enums.ClassNames.Path);
      boxes.item(i).classList.remove(Enums.ClassNames.Visited);
      boxes.item(i).classList.remove(Enums.ClassNames.Backtrack);
    }
  }

  aStar(withTimeout: boolean = true): void {
    this.cleanEnv();

    // A*
    const open: {
      row: number;
      column: number;
      f: number;
      g?: number;
      h?: number;
    }[] = [];
    const closed: {
      row: number;
      column: number;
      f: number;
      g?: number;
      h?: number;
    }[] = [];
    open.push({ ...this.startNode, f: 0 });

    while (open.length !== 0) {
      const q = open.sort((x, y) => x.f - y.f)[0];

      const qIndex = open.findIndex(
        (x) => x.row === q.row && x.column === q.column
      );
      open.splice(qIndex, 1);

      // row - 1, col
      const blockPosIndex = this.blocks.findIndex(
        (x) => x.row === q.row - 1 && x.column === q.column
      );
    }

    setTimeout(() => {
      if (withTimeout) {
        this.store.dispatch(new fromVisualizeActions.VisualizeEndAction());
      }
      this.isCompletedOnce = true;
    }, (this.delay += this.speed));
  }

  dijkstra(withTimeout: boolean = true): void {
    this.cleanEnv();
    const sptSet: Node[] = [];
    const distanceMatrix: number[][] = [];
    for (let i = 0; i < this.rowCount; i++) {
      distanceMatrix.push(Array(this.colCount).fill(Number.POSITIVE_INFINITY));
    }
    distanceMatrix[this.startNode.row][this.startNode.column] = 0;
    // console.log(distanceMatrix);
    // console.log(this.rowCount, this.colCount);
    // sptSet.push({...this.startNode});
    while (
      !sptSet.find(
        (x) => x.row === this.endNode.row && x.column === this.endNode.column
      )
    ) {
      let minDistance = Number.POSITIVE_INFINITY;
      let minI = -1;
      let minJ = -1;
      for (let i = 0; i < this.rowCount; i++) {
        for (let j = 0; j < this.colCount; j++) {
          const searchPosIndex = sptSet.findIndex(
            (x) => x.row === i && x.column === j
          );
          const blockPosIndex = this.blocks.findIndex(
            (x) => x.row === i && x.column === j
          );
          if (
            minDistance > distanceMatrix[i][j] &&
            searchPosIndex === -1 &&
            blockPosIndex === -1
          ) {
            minDistance = distanceMatrix[i][j];
            minI = i;
            minJ = j;
          }
        }
      }
      if (minI === -1 || minJ === -1) {
        break;
      }
      const minDistanceNode = { row: minI, column: minJ };
      sptSet.push(minDistanceNode);
      this.markNodeAsSearched([minDistanceNode], withTimeout);
      if (
        minI - 1 >= 0 &&
        distanceMatrix[minI - 1][minJ] >
          distanceMatrix[minI][minJ] + this.weights[minI][minJ][0]
      ) {
        distanceMatrix[minI - 1][minJ] =
          distanceMatrix[minI][minJ] + this.weights[minI][minJ][0];
      }
      if (
        minI + 1 < this.rowCount &&
        distanceMatrix[minI + 1][minJ] >
          distanceMatrix[minI][minJ] + this.weights[minI + 1][minJ][0]
      ) {
        distanceMatrix[minI + 1][minJ] =
          distanceMatrix[minI][minJ] + this.weights[minI + 1][minJ][0];
      }
      if (
        minJ - 1 >= 0 &&
        distanceMatrix[minI][minJ - 1] >
          distanceMatrix[minI][minJ] + this.weights[minI][minJ - 1][1]
      ) {
        distanceMatrix[minI][minJ - 1] =
          distanceMatrix[minI][minJ] + this.weights[minI][minJ - 1][1];
      }
      if (
        minJ + 1 < this.colCount &&
        distanceMatrix[minI][minJ + 1] >
          distanceMatrix[minI][minJ] + this.weights[minI][minJ][1]
      ) {
        distanceMatrix[minI][minJ + 1] =
          distanceMatrix[minI][minJ] + this.weights[minI][minJ][1];
      }
    }
    // console.log(sptSet);
    setTimeout(() => {
      if (withTimeout) {
        this.store.dispatch(new fromVisualizeActions.VisualizeEndAction());
      }
      this.isCompletedOnce = true;
    }, (this.delay += this.speed));
  }

  BFS(withTimeout: boolean = true): void {
    this.cleanEnv();
    let queue: Node[] = [this.startNode];
    let isFound = false;
    let searchedPosotions: Node[] = [this.startNode];
    this.sortestPath = [this.startNode];
    while (queue.length > 0) {
      let firstFromQueue = queue.splice(0, 1)[0];
      this.markNodeAsSearched([firstFromQueue], withTimeout);
      const nodes = [];
      // tslint:disable-next-line: one-variable-per-declaration
      let r1 = -1,
        r2 = -1,
        c1 = -1,
        c2 = -1;
      if (firstFromQueue.row - 1 >= 0) {
        const node = {
          row: firstFromQueue.row - 1,
          column: firstFromQueue.column,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          nodes.push(node);
          if (
            node.row === this.endNode.row &&
            node.column === this.endNode.column
          ) {
            isFound = true;
            break;
          } else {
            r1 = node.row;
            queue.push(node);
          }
        }
      }
      if (firstFromQueue.row + 1 < this.rowCount) {
        const node = {
          row: firstFromQueue.row + 1,
          column: firstFromQueue.column,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          nodes.push(node);
          if (
            node.row === this.endNode.row &&
            node.column === this.endNode.column
          ) {
            isFound = true;
            break;
          } else {
            r2 = node.row;
            queue.push(node);
          }
        }
      }
      if (firstFromQueue.column - 1 >= 0) {
        const node = {
          row: firstFromQueue.row,
          column: firstFromQueue.column - 1,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          nodes.push(node);
          if (
            node.row === this.endNode.row &&
            node.column === this.endNode.column
          ) {
            isFound = true;
            break;
          } else {
            c1 = node.column;
            queue.push(node);
          }
        }
      }
      if (firstFromQueue.column + 1 < this.colCount) {
        const node = {
          row: firstFromQueue.row,
          column: firstFromQueue.column + 1,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          nodes.push(node);
          if (
            node.row === this.endNode.row &&
            node.column === this.endNode.column
          ) {
            isFound = true;
            break;
          } else {
            c2 = node.column;
            queue.push(node);
          }
        }
      }
    }
    if (isFound) {
      this.sortestPath.push(this.endNode);
      this.markNodeAsSearched([this.endNode], withTimeout);
    }
    setTimeout(() => {
      if (withTimeout) {
        this.store.dispatch(new fromVisualizeActions.VisualizeEndAction());
      }
      this.isCompletedOnce = true;
    }, (this.delay += this.speed));
  }

  DFS(withTimeout: boolean = true): void {
    this.cleanEnv();
    let stack: Node[] = [this.startNode];
    let isFound = false;
    let searchedPosotions: Node[] = [this.startNode];
    this.sortestPath = [this.startNode];
    while (stack.length > 0) {
      let firstFromStack = stack.slice(stack.length - 1)[0];
      if (
        firstFromStack.row === this.endNode.row &&
        firstFromStack.column === this.endNode.column
      ) {
        isFound = true;
        break;
      }
      this.markNodeAsSearched([firstFromStack], withTimeout);
      // tslint:disable-next-line: one-variable-per-declaration
      if (firstFromStack.row - 1 >= 0) {
        const node = {
          row: firstFromStack.row - 1,
          column: firstFromStack.column,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          stack.push(node);
          continue;
        }
      }
      if (firstFromStack.row + 1 < this.rowCount) {
        const node = {
          row: firstFromStack.row + 1,
          column: firstFromStack.column,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          stack.push(node);
          continue;
        }
      }
      if (firstFromStack.column + 1 < this.colCount) {
        const node = {
          row: firstFromStack.row,
          column: firstFromStack.column + 1,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          stack.push(node);
          continue;
        }
      }
      if (firstFromStack.column - 1 >= 0) {
        const node = {
          row: firstFromStack.row,
          column: firstFromStack.column - 1,
        };
        const searchPosIndex = searchedPosotions.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        const blockPosIndex = this.blocks.findIndex(
          (x) => x.row === node.row && x.column === node.column
        );
        if (searchPosIndex === -1 && blockPosIndex === -1) {
          searchedPosotions.push(node);
          stack.push(node);
          continue;
        }
      }
      stack.pop();
    }
    if (isFound) {
      this.sortestPath.push(this.endNode);
      //   console.log(this.sortestPath);
      this.markNodeAsSearched([this.endNode], withTimeout);
      // this.visualizeSortedPath(withTimeout);
    }
    setTimeout(() => {
      if (withTimeout) {
        this.store.dispatch(new fromVisualizeActions.VisualizeEndAction());
      }
      this.isCompletedOnce = true;
    }, (this.delay += this.speed));
  }

  modSub(v1: number, v2: number): number {
    return v1 > v2 ? v1 - v2 : v2 - v1;
  }

  markNodeAsSearched(nodes: Node[], withTimeout: boolean = true): void {
    if (withTimeout) {
      setTimeout(() => {
        nodes.forEach((node) => {
          const element = document.getElementsByClassName(
            `${node.row}-${node.column}`
          )[0];
          if (element.classList.contains(Enums.ClassNames.Visited)) {
            element.classList.remove(Enums.ClassNames.Visited);
            element.classList.add(Enums.ClassNames.Backtrack);
          } else {
            element.classList.add(Enums.ClassNames.Visited);
          }
        });
      }, (this.delay += this.speed));
    } else {
      nodes.forEach((node) => {
        const element = document.getElementsByClassName(
          `${node.row}-${node.column}`
        )[0];
        if (element.classList.contains(Enums.ClassNames.Visited)) {
          element.classList.remove(Enums.ClassNames.Visited);
          element.classList.add(Enums.ClassNames.Backtrack);
        } else {
          element.classList.add(Enums.ClassNames.Visited);
        }
      });
    }
  }

  visualizeSortedPath(withTimeout: boolean = true): void {
    if (withTimeout) {
      this.sortestPath.forEach((x) => {
        setTimeout(() => {
          const element = document.getElementsByClassName(
            `${x.row}-${x.column}`
          )[0];
          (element as HTMLElement).classList.add(Enums.ClassNames.Path);
        }, (this.delay += this.speed));
      });
    } else {
      this.sortestPath.forEach((x) => {
        const element = document.getElementsByClassName(
          `${x.row}-${x.column}`
        )[0];
        (element as HTMLElement).classList.add(Enums.ClassNames.Path);
      });
    }
  }

  initializeConnectedNodes(): void {
    let counter = this.rowCount * this.colCount;
    const connectedArray: string[] = [];
    while (counter--) {
      connectedArray.push(`cdk-drop-list-${counter}`);
    }
    counter = this.rowCount * this.colCount;
    this.connectedDropListArray = [];
    while (counter--) {
      this.connectedDropListArray.push(connectedArray);
    }
  }

  initialize(): void {
    const startNode = {
      row: this.random(this.rowCount),
      column: this.random(this.colCount),
    };
    let endNode: Node;
    while (true) {
      endNode = {
        row: this.random(this.rowCount),
        column: this.random(this.colCount),
      };
      if (
        startNode.row !== endNode.row ||
        startNode.column !== endNode.column
      ) {
        break;
      }
    }
    this.store.dispatch(
      new fromVisualizeActions.InitializeStartEndAction({ startNode, endNode })
    );
    this.initializeConnectedNodes();
    this.initializeIndexArrays();
  }

  initializeIndexArrays(): void {
    this.arrayIndexes = [];
    const innerList = [];
    for (let j = 0; j < this.colCount; j++) {
      innerList.push(j);
    }
    for (let i = 0; i < this.rowCount; i++) {
      this.arrayIndexes.push(innerList);
    }
  }

  enterPredicate(drag: CdkDrag, drop: CdkDropList): boolean {
    return !drop.element.nativeElement.children[0].classList.contains(
      'material-icons'
    );
  }

  onDrop(event: CdkDragDrop<any>): void {
    if (
      event.item.data !== 'block' &&
      event.container.data !== event.previousContainer.data
    ) {
      const data = (event.container.data as string).split('-');
      const node: Node = {
        row: +data[0],
        column: +data[1],
      };
      if (event.item.data === 'Start') {
        this.startNode = node;
      } else {
        this.endNode = node;
      }
      if (this.isCompletedOnce) {
        this.visualize(this.currentAlgo, false);
      }
    }
  }

  addBlock(event: CdkDragStart): void {
    const data = (event.source.dropContainer.data as string).split('-');
    const node: Node = {
      row: +data[0],
      column: +data[1],
    };
    const index = this.blocks.findIndex(
      (x) => x.row === node.row && x.column === node.column
    );
    const element = document.getElementsByClassName(
      `${node.row}-${node.column}`
    )[0];
    if (index > -1) {
      this.blocks.splice(index, 1);
      (element as HTMLElement).classList.remove(Enums.ClassNames.Block);
    } else {
      (element as HTMLElement).classList.add(Enums.ClassNames.Block);
      this.blocks.push(node);
    }
  }

  updateBlocks(event: CdkDragEnter<any>): void {
    const data = (event.container.data as string).split('-');
    const node: Node = {
      row: +data[0],
      column: +data[1],
    };
    const index = this.blocks.findIndex(
      (x) => x.row === node.row && x.column === node.column
    );
    const element = document.getElementsByClassName(
      `${node.row}-${node.column}`
    )[0];
    if (index > -1) {
      this.blocks.splice(index, 1);
      (element as HTMLElement).classList.remove(Enums.ClassNames.Block);
    } else {
      (element as HTMLElement).classList.add(Enums.ClassNames.Block);
      this.blocks.push(node);
    }
  }

  manageWallNode(row: number, column: number): void {
    const node: Node = {
      row,
      column,
    };
    const index = this.blocks.findIndex(
      (x) => x.row === row && x.column === column
    );
    const element = document.getElementsByClassName(`${row}-${column}`)[0];
    if (index > -1) {
      this.blocks.splice(index, 1);
      (element as HTMLElement).classList.remove(Enums.ClassNames.Block);
    } else {
      (element as HTMLElement).classList.add(Enums.ClassNames.Block);
      this.blocks.push(node);
    }
  }

  random(max: number, min: number = 0): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
