import { App, NavParams, NavController, AlertController } from 'ionic-angular';
import { Component, forwardRef } from '@angular/core';
import { AgeInfo } from '../../../common/age';
import { GenderInfo } from '../../../common/gender';
import { PetImage } from '../../../common/pet-image';
import { MateImage } from '../../../common/mate-image';
import { MatesService } from '../../../services/mates.service';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { STATUS_ACCEPTED, STATUS_PENDING, STATUS_REQUESTED } from '../../../models/friendship.interface';

@Component({
    templateUrl: 'build/pages/mates/view/mate.view.html',
    directives: [
        forwardRef(() => GenderInfo),
        forwardRef(() => AgeInfo),
        forwardRef(() => PetImage),
        forwardRef(() => MateImage)
    ]
})

export class MateViewPage {
    nav: NavController;
    mate: User;
    friendshipId: string;
    friendshipStatus: string;
    friendshipStatuses = {
        accepted: STATUS_ACCEPTED,
        pending: STATUS_PENDING,
        requested: STATUS_REQUESTED
    };

    constructor(app: App,
                navParams: NavParams,
                private mates: MatesService,
                private auth: AuthService,
                private alertCtrl: AlertController) {
        this.nav = app.getActiveNav();
        this.mate = navParams.get('mate');
        this.mapFriendship();
    }

    addMate() {
        this.mates.add(this.mate).then(() => this.mapFriendship());
    }

    approveMate() {
        this.mates.add(this.mate).then(() => this.friendshipStatus = STATUS_ACCEPTED);
    }

    cancelMate() {
        this.mates.remove(this.friendshipId).then(() => {
            this.friendshipStatus = null;
            this.friendshipId = null;
        });
    }

    removeMate() {
        const alert = this.alertCtrl.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${this.mate.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        this.mates.remove(this.friendshipId)
                            .then((res: any) => {
                                if (res.success) {
                                    return alert.dismiss();
                                }
                            })
                            .then(() => this.nav.pop());
                    }
                }
            ]
        });
        alert.present();
    }

    private mapFriendship() {
        const friendship = this.auth.user.mates.find(
            friendship => friendship.friend._id === this.mate._id
        );
        if (friendship) {
            this.friendshipStatus = friendship.status;
            this.friendshipId = friendship._id;
        }
    }
}
