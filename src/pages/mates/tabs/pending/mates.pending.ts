import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { MatesService } from '../../mates.service';
import { MateViewPage } from '../../view/mate-view.page';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    templateUrl: 'mates.pending.html'
})

export class MatesPendingPage {
    constructor(public matesService: MatesService,
                private modalCtrl: ModalController,
                private nav: NavController) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }
}
