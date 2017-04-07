import { NavController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateViewPage } from '../../view/mate-view.page';
import { MatesService } from '../../mates.service';
import { MatesSearchPage } from '../../search/mates-search.page';

@Component({
    templateUrl: 'mates-accepted.page.html'
})

export class MatesAcceptedPage {

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
