import { NavController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateViewPage } from '../../view/mate-view.page';
import { MatesService } from '../../mates.service';
import { MatesSearchPage } from '../../search/mates-search.page';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app/state';

@Component({
    templateUrl: 'mates-accepted.page.html'
})

export class MatesAcceptedPage {

    constructor(public matesService: MatesService,
                private modalCtrl: ModalController,
                private nav: NavController,
                private store: Store<AppState>) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }
}
