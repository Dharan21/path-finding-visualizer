import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as Constants from './../../utils/constants';
import * as AppState from './../../store/app.reducers';
import * as fromVisualizeActions from './../../store/actions/visualize.actions';

@Component({
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.css']
})
export class HeaderComponent {
    algoDropdown = Constants.PathFindingAlgoDropdown;

    constructor(private store: Store<AppState.AppState>) {}

    onSubmit(form: NgForm): void {
        console.log(form.value);
        this.store.dispatch(new fromVisualizeActions.VisualizeStartAction(form.value.algo));
    }
}