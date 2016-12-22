import { NavController, AlertController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateViewPage } from '../../view/mate.view';
import { IFriendship } from '../../../../models/IFriendship';
import { MatesService } from '../../../../providers/mates.service';
import { AuthService } from '../../../../providers/auth.service';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    templateUrl: 'mates.accepted.html'
})

export class MatesAcceptedPage {
    constructor(public mates: MatesService,
                public auth: AuthService,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private nav: NavController) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    removeMate(friendship: IFriendship) {
        const alert = this.alertCtrl.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${friendship.friend.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        this.mates.remove(friendship._id).then(() => alert.dismiss());
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
