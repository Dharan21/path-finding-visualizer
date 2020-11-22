import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import * as Constants from './../../utils/constants';

@Component({
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.css']
})
export class HeaderComponent {
    algoDropdown = Constants.PathFindingAlgoDropdown;

    onSubmit(form: NgForm): void {

    }
}