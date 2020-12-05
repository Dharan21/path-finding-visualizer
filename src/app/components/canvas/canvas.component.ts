import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
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
    styleUrls: ['canvas.component.css']
})
export class CanvasComponent implements OnInit {
    startNode: Node;
    endNode: Node;
    rowCount = 15;
    colCount = 25;
    rowsArray: number[];
    colsArray: number[];
    connectedDropListArray: string[][] = [];
    arrayIndexes: number[][] = [];
    windowsWidth: number;
    delay = 0;
    speed = 20;
    sortestPath: Node[] = [];

    constructor(
        private store: Store<fromApp.AppState>
    ) {
        this.rowsArray = Array(this.rowCount);
        this.colsArray = Array(this.colCount);
    }


    ngOnInit(): void {
        this.store.select('visualizeData').subscribe((data: VisualizeReducer.State) => {
            if (!this.startNode && !this.endNode) {
                this.startNode = data.startNode;
                this.endNode = data.endNode;
            } else if (data.visualizeStarted) {
                this.visualize(data.algorithm);
            }
        });
        this.colCount = Math.floor((window.innerWidth - 10) / 30);
        this.colsArray = Array(this.colCount);
        this.initialize();
    }

    visualize(algo: string): void {
        switch (algo) {
            case Enums.PathFindingAlgorithms.DFS:
            case Enums.PathFindingAlgorithms.BFS:
                this.BFS();
        }
    }

    BFS(): void {
        const boxes: HTMLCollectionOf<Element> = document.getElementsByClassName('box');
        let queue: Node[] = [this.startNode];
        let isFound = false;
        let searchedPosotions: Node[] = [this.startNode];
        this.sortestPath = [this.startNode];
        while (queue.length > 0) {
            // debugger
            let firstFromQueue = queue.splice(0, 1)[0];
            const nodes = [];
            // tslint:disable-next-line: one-variable-per-declaration
            let r1 = -1, r2 = -1, c1 = -1, c2 = -1;
            if (firstFromQueue.row - 1 >= 0) {
                const node = { row: firstFromQueue.row - 1, column: firstFromQueue.column };
                r1 = node.row;
                if (searchedPosotions.findIndex(x => x.row === node.row && x.column === node.column) === -1) {
                    searchedPosotions.push(node);
                    nodes.push(node);
                    if (node.row === this.endNode.row && node.column === this.endNode.column) {
                        isFound = true;
                        break;
                    } else {
                        queue.push(node);
                    }
                }
            }
            if (firstFromQueue.row + 1 < this.rowCount) {
                const node = { row: firstFromQueue.row + 1, column: firstFromQueue.column };
                r2 = node.row;
                if (searchedPosotions.findIndex(x => x.row === node.row && x.column === node.column) === -1) {
                    searchedPosotions.push(node);
                    nodes.push(node);
                    if (node.row === this.endNode.row && node.column === this.endNode.column) {
                        isFound = true;
                        break;
                    } else {
                        queue.push(node);
                    }
                }
            }
            if (firstFromQueue.column - 1 >= 0) {
                const node = { row: firstFromQueue.row, column: firstFromQueue.column - 1 };
                c1 = node.column;
                if (searchedPosotions.findIndex(x => x.row === node.row && x.column === node.column) === -1) {
                    searchedPosotions.push(node);
                    nodes.push(node);
                    if (node.row === this.endNode.row && node.column === this.endNode.column) {
                        isFound = true;
                        break;
                    } else {
                        queue.push(node);
                    }
                }
            }
            if (firstFromQueue.column + 1 < this.colCount) {
                const node = { row: firstFromQueue.row, column: firstFromQueue.column + 1 };
                c2 = node.column;
                if (searchedPosotions.findIndex(x => x.row === node.row && x.column === node.column) === -1) {
                    searchedPosotions.push(node);
                    nodes.push(node);
                    if (node.row === this.endNode.row && node.column === this.endNode.column) {
                        isFound = true;
                        break;
                    } else {
                        queue.push(node);
                    }
                }
            }
            if (this.sortestPath.findIndex(x => x.row === firstFromQueue.row && x.column === firstFromQueue.column) > -1) {
                const rm1 = r1 !== -1 ? this.modSub(this.endNode.row, r1) : Number.POSITIVE_INFINITY;
                const rm2 = r2 !== -1 ? this.modSub(this.endNode.row, r2) : Number.POSITIVE_INFINITY;
                const r = this.endNode.row === firstFromQueue.row ? this.endNode.row : rm1 > rm2 ? r2 : r1;

                if (this.sortestPath.findIndex(x => x.row === r && x.column === firstFromQueue.column) > -1) {
                    const cm1 = c1 !== -1 ? this.modSub(this.endNode.column, c1) : Number.POSITIVE_INFINITY;
                    const cm2 = c2 !== -1 ? this.modSub(this.endNode.column, c2) : Number.POSITIVE_INFINITY;
                    const c = this.endNode.column === firstFromQueue.column ? this.endNode.column : cm1 > cm2 ? c2 : c1;
                    this.sortestPath.push({ row: firstFromQueue.row, column: c });
                } else {
                    this.sortestPath.push({ row: r, column: firstFromQueue.column });
                }

            }
            this.markNodeAsSearched(nodes);
        }
        if (isFound) {
            this.sortestPath.push(this.endNode);
            console.log(this.sortestPath);
            this.markNodeAsSearched([this.endNode]);
            this.visualizeSortedPath();
        }
    }

    modSub(v1: number, v2: number): number {
        return v1 > v2 ? v1 - v2 : v2 - v1;
    }

    markNodeAsSearched(nodes: Node[]): void {
        setTimeout(() => {
            nodes.forEach(node => {
                const element = document.getElementsByClassName(`${node.row}-${node.column}`)[0];
                // (element as HTMLElement).style.backgroundColor = 'blue';
                (element as HTMLElement).classList.add('visited');
            });
        }, this.delay += this.speed);
    }

    visualizeSortedPath(): void {
        this.sortestPath.forEach(x => {
            setTimeout(() => {
                const element = document.getElementsByClassName(`${x.row}-${x.column}`)[0];
                (element as HTMLElement).classList.add('path');
            }, this.delay += this.speed);
        });
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
            column: this.random(this.colCount)
        };
        let endNode: Node;
        while (true) {
            endNode = {
                row: this.random(this.rowCount),
                column: this.random(this.colCount)
            };
            if (startNode.row !== endNode.row || startNode.column !== endNode.column) {
                break;
            }
        }
        this.store.dispatch(new fromVisualizeActions.InitializeStartEndAction({ startNode, endNode }));
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
        return drop.element.nativeElement.childElementCount < 1;
    }

    onDrop(event: CdkDragDrop<any>): void {
        console.log(event);
        if (event.container.data !== event.previousContainer.data) {
            const data = (event.container.data as string).split('-');
            const node: Node = {
                row: +data[0],
                column: +data[1]
            }
            if (event.item.data === 'Start') {
                this.startNode = node;
            } else {
                this.endNode = node;
            }
        }
    }

    random(end: number): number {
        return Math.floor(Math.random() * end);
    }
}