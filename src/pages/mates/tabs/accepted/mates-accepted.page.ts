import { NavController, AlertController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateViewPage } from '../../view/mate-view.page';
import { IFriendship } from '../../../../models/interfaces/IFriendship';
import { MatesService } from '../../mates.service';
import { MatesSearchPage } from '../../search/mates.search';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app/state';
import { MatesActions } from '../../mates.actions';
import { AuthService } from '../../../auth/auth.service';

@Component({
    templateUrl: 'mates-accepted.page.html'
})

export class MatesAcceptedPage {

    constructor(public matesService: MatesService,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private nav: NavController,
                private store: Store<AppState>,
                private authService: AuthService) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    removeMate(friendship: IFriendship) {
        const alert = this.alertCtrl.create({
            title: 'Remove mate',
            message: `Remove ${friendship.friend.name} from your mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        alert.dismiss();
                        this.store.dispatch(MatesActions.remove(this.authService.userId, friendship.friend._id));
                    }
                }
            ]
        });
        alert.present();
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }
}
