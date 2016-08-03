import { forwardRef, Component } from '@angular/core';
import { MateImage } from '../../../../common/mate-image';
import { MatesService } from '../../../../services/mates.service';
import { Friendship } from '../../../../models/friendship.interface';
import { MatesSearchPage } from '../../search/mates.search';
import { Modal, NavController } from 'ionic-angular';
import { MateViewPage } from '../../view/mate.view';

@Component({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/requested/mates.requested.html'
})

export class MatesRequestedPage {
    constructor(public mates: MatesService,
                private nav: NavController) {
    }

    viewMate(friendship: Friendship) {
        this.nav.push(MateViewPage, {
            mate: friendship.friend,
            friendshipId: friendship._id
        });
    }

    searchMateModal() {
        this.nav.present(Modal.create(MatesSearchPage));
    }

    cancelRequest(friendship: Friendship) {
        this.mates.remove(friendship._id);
    }
}
