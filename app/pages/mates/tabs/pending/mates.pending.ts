import { forwardRef, Component } from '@angular/core';
import { MateImage } from '../../../../common/mate-image';
import { MatesService } from '../../../../services/mates.service';
import { Friendship } from '../../../../models/friendship.interface';
import { MatesSearchPage } from '../../search/mates.search';
import { Modal, NavController } from 'ionic-angular';

@Component({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/pending/mates.pending.html'
})

export class MatesPendingPage {
    constructor(public mates:MatesService,
                private nav:NavController) {
    }

    searchMateModal() {
        this.nav.present(Modal.create(MatesSearchPage));
    }

    acceptRequest(mate:Friendship) {
        this.mates.add(mate.friend).subscribe(() => {
        });
    }

    cancelRequest(mate:Friendship) {
        this.mates.remove(mate).subscribe(() => {
        });
    }
}