import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'edit-delete-popover-page',
    templateUrl: 'edit-delete-popover-page.html'
})
export class EditDeletePopoverPage {
    onEditClick: Function;
    onDeleteClick: Function;

    constructor(public viewCtrl: ViewController,
                navParams: NavParams) {

        this.onEditClick = navParams.get('onEditClick');
        this.onDeleteClick = navParams.get('onEditClick');
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
