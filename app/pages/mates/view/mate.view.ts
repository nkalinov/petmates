import { App, NavParams, NavController, Alert } from 'ionic-angular';
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
                private auth: AuthService) {
        this.nav = app.getActiveNav();
        this.mate = navParams.get('mate');
        this.friendshipId = navParams.get('friendshipId');

        if (this.friendshipId) {
            // see what actions are available (accept/remove/new)
            const friendship = auth.user.mates.find(friendship => friendship._id === this.friendshipId);
            if (friendship) {
                this.friendshipStatus = friendship.status;
            }
        }
    }

    addMate() {
        this.mates.add(this.mate).subscribe((res: any) => {
            if (res.success) {
                this.friendshipStatus = STATUS_REQUESTED;
                const friendship = this.auth.user.mates.find(friendship => friendship.friend._id === this.mate._id);
                if (friendship) {
                    this.friendshipId = friendship._id;
                }
            }
        });
    }

    approveMate() {
        this.mates.add(this.mate).subscribe((res: any) => {
            if (res.success) {
                this.friendshipStatus = STATUS_ACCEPTED;
            }
        });
    }

    cancelMate() {
        this.mates.remove(this.friendshipId).then((res: any) => {
            if (res.success) {
                this.friendshipStatus = null;
                this.friendshipId = null;
            }
        });
    }

    removeMate() {
        let alert = Alert.create({
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
                        this.mates.remove(this.friendshipId).then((res: any) => {
                            if (res.success) {
                                setTimeout(() => {
                                    this.nav.pop();
                                }, 1000);
                            }
                        });
                    }
                }
            ]
        });
        this.nav.present(alert);
    }
}
