import { Component } from '@angular/core';
import { MatesService } from '../../mates.service';
import { NavController, ModalController } from 'ionic-angular';
import { MateViewPage } from '../../view/mate-view.page';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    templateUrl: 'mates.requested.html'
})

export class MatesRequestedPage {
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
