import { forwardRef, Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { MateImage } from '../../../../common/mate-image';
import { MatesService } from '../../../../services/mates.service';
import { Friendship } from '../../../../models/friendship.interface';
import { MateViewPage } from '../../view/mate.view';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/pending/mates.pending.html'
})

export class MatesPendingPage {
    constructor(public mates: MatesService,
                private modalCtrl: ModalController,
                private nav: NavController) {
    }

    viewMate(friendship: Friendship) {
        this.nav.push(MateViewPage, {
            mate: friendship.friend,
            friendshipId: friendship._id
        });
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }
}
