import { NavController, Alert, Modal } from 'ionic-angular';
import { forwardRef, Component } from '@angular/core';
import { MateImage } from '../../../../common/mate-image';
import { MateViewPage } from '../../view/mate.view';
import { Friendship } from '../../../../models/friendship.interface';
import { MatesService } from '../../../../services/mates.service';
import { MessageTimePipe } from '../../../../pipes/message.time.pipe';
import { AuthService } from '../../../../services/auth.service';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/accepted/mates.accepted.html',
    pipes: [MessageTimePipe]
})

export class MatesAcceptedPage {
    constructor(public mates: MatesService,
                public auth: AuthService,
                private nav: NavController) {
    }

    searchMateModal() {
        this.nav.present(Modal.create(MatesSearchPage));
    }

    viewMate(friendship: Friendship) {
        this.nav.push(MateViewPage, {
            mate: friendship.friend,
            friendshipId: friendship._id
        });
    }

    removeMate(friendship: Friendship) {
        let alert = Alert.create({
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
                    handler: () => this.mates.remove(friendship._id)
                }
            ]
        });
        this.nav.present(alert);
    }
}
