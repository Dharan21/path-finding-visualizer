import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, OnInit } from '@angular/core';

import { Node } from './../../models/node.model';

@Component({
    selector: 'app-canvas',
    templateUrl: 'canvas.component.html',
    styleUrls: ['canvas.component.css']
})
export class CanvasComponent implements OnInit {
    startNode: Node;
    endNode: Node;
    rowCount = 10;
    colCount = 15;
    rowsArray: number[];
    colsArray: number[];
    connectedDropListArray: string[][] = [];

    constructor() {
        this.rowsArray = Array(this.rowCount);
        this.colsArray = Array(this.colCount);
    }

    ngOnInit(): void {
        this.initialize();
        console.log(this.startNode);
        console.log(this.endNode);
    }

    initializeConnectedNodes(): void {
        let counter = this.rowCount * this.colCount;
        const connectedArray: string[] = [];
        while (counter--) {
            connectedArray.push(`cdk-drop-list-${counter}`);
        }
        counter = this.rowCount * this.colCount;
        while (counter--) {
            this.connectedDropListArray.push(connectedArray);
        }
    }

    initialize(): void {
        this.startNode = {
            row: this.random(this.rowCount),
            column: this.random(this.colCount)
        };
        while (true) {
            this.endNode = {
                row: this.random(this.rowCount),
                column: this.random(this.colCount)
            };
            if (this.startNode.row !== this.endNode.row || this.startNode.column !== this.endNode.column) {
                break;
            }
        }
        this.initializeConnectedNodes();
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