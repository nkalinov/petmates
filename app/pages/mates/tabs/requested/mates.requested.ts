import {Page} from 'ionic-angular';
import {forwardRef} from '@angular/core';
import {MateImage} from '../../../../common/mate-image';
import {MatesService} from '../../../../services/mates.service';
import {Friendship} from '../../../../models/friendship.interface';

@Page({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/requested/mates.requested.html'
})

export class MatesRequestedPage {
    constructor(public mates:MatesService) {
    }

    cancelRequest(mate:Friendship) {
        this.mates.remove(mate).subscribe(() => {});
    }
}