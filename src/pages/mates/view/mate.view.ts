import { NavParams, NavController, AlertController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AgeInfo } from '../../../common/age';
import { GenderInfo } from '../../../common/gender';
import { PetImage } from '../../../common/pet-image';
import { MateImage } from '../../../common/mate-image';
import { MatesService } from '../../../providers/mates.service';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../providers/auth.service';
import { STATUS_ACCEPTED, STATUS_PENDING, STATUS_REQUESTED } from '../../../models/friendship.interface';

@Component({
    templateUrl: 'mate.view.html',
    directives: [GenderInfo, AgeInfo, PetImage, MateImage]
})

export class MateViewPage {
    mate: User = new User();
    friendshipId: string;
    friendshipStatus: string;
    friendshipStatuses = {
        accepted: STATUS_ACCEPTED,
        pending: STATUS_PENDING,
        requested: STATUS_REQUESTED
    };

    constructor(public auth: AuthService,
                private navParams: NavParams,
                private nav: NavController,
                private mates: MatesService,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController) {
    }

    ionViewWillEnter() {
        const loader = this.loadingCtrl.create();
        loader.present();
        this.mates
            .getById(this.navParams.get('id'))
            .then(user => {
                this.mate = user;
                // remove me and not accepted mates
                this.mate.mates = this.mate.mates.filter(f =>
                    f.friend._id !== this.auth.user._id &&
                    f.status === this.friendshipStatuses.accepted ? f.friend : null
                );
                this.mapFriendship();
                loader.dismiss();
            });
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
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
