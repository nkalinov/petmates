import {forwardRef, Component} from '@angular/core';
import {MateImage} from '../../../../common/mate-image';
import {MatesService} from '../../../../services/mates.service';
import {Friendship} from '../../../../models/friendship.interface';

@Component({
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