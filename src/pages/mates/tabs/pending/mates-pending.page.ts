import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { MatesService } from '../../mates.service';
import { MateViewPage } from '../../view/mate-view.page';
import { MatesSearchPage } from '../../search/mates-search.page';
import { MatesActions } from '../../mates.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app/state';
import { AuthService } from '../../../auth/auth.service';

@Component({
    templateUrl: 'mates-pending.page.html'
})

export class MatesPendingPage {
    constructor(public matesService: MatesService,
                private modalCtrl: ModalController,
                private nav: NavController,
                private store: Store<AppState>,
                private authService: AuthService) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }

    addMate(id: string) {
        this.store.dispatch(MatesActions.add(this.authService.user._id, id));
    }
}
