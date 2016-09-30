import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
    templateUrl: 'report-place.html',
})
export class ReportPlacePage {
    report: any = {
        reason: '',
        comment: ''
    };

    constructor(public viewCtrl: ViewController) {
    }

    sendReport() {

    }
}
