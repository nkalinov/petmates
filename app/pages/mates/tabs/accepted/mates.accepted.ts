import {Page, NavController} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {MateImage} from '../../../../common/mate-image';
import {MateViewPage} from "../../view/mate.view";
import {Friendship} from "../../../../models/friendship.interface";
import {MatesService} from "../../../../services/mates.service";

@Page({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/accepted/mates.accepted.html'
})

export class MatesAcceptedPage {

    constructor(public mates:MatesService,
                private nav:NavController) {
    }

    viewMate(friendship:Friendship) {
        this.nav.push(MateViewPage, {
            mate: friendship
        });
    }
}