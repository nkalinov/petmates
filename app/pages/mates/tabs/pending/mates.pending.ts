import {Page} from 'ionic-angular';
import {forwardRef} from '@angular/core';
import {MateImage} from '../../../../common/mate-image';
import {MatesService} from '../../../../services/mates.service';
import {Friendship} from '../../../../models/friendship.interface';

@Page({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/pending/mates.pending.html'
})

export class MatesPendingPage {
    constructor(public mates:MatesService) {
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