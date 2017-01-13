import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { ReportsService } from '../../providers/reports.service';

@Component({
    templateUrl: 'report-modal.html',
})
export class ReportModalPage {
    description: string = '';

    private type: 'user' | 'place';
    private id: string;

    constructor(public viewCtrl: ViewController,
                private reports: ReportsService,
                navParams: NavParams) {
        this.id = navParams.get('id');
        this.type = navParams.get('type');
    }

    submit() {
        this.reports.createReport(this.description, this.id, this.type)
            .then(() => this.viewCtrl.dismiss());
    }
}
