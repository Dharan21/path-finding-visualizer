import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Node } from './../../models/node.model';
import * as fromVisualizeActions from './../../store/actions/visualize.actions';
import * as VisualizeReducer from './../..//store/reducers/visualize.reducer';
import * as fromApp from './../../store/app.reducers';

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

    constructor(
        private store: Store<fromApp.AppState>
    ) {
        this.rowsArray = Array(this.rowCount);
        this.colsArray = Array(this.colCount);
    }


    ngOnInit(): void {
        this.store.select('visualizeData').subscribe((data: VisualizeReducer.State) => {
            this.startNode = data.startNode;
            this.endNode = data.endNode;
        });
        this.colCount = Math.floor((window.innerWidth - 10) / 30);
        this.colsArray = Array(this.colCount);
        this.initialize();
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
        this.store.dispatch(new fromVisualizeActions.InitializeStartEnd({ startNode, endNode }));
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