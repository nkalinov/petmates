import {Page, NavController, Modal} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {MateImage} from '../../../../common/mate-image';
import {MateViewPage} from "../../view/mate.view";
import {Friendship} from "../../../../models/friendship.interface";
import {MatesService} from "../../../../services/mates.service";
import {User} from "../../../../models/user.model";
import {ChatPage} from "../../../chat/chat";
import {MessageTimePipe} from "../../../../pipes/message.time.pipe";
import {FriendshipStatusPipe} from "../../../../pipes/friendship.status.pipe";
import {AuthService} from "../../../../services/auth.service";

@Page({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/accepted/mates.accepted.html',
    pipes: [MessageTimePipe, FriendshipStatusPipe]
})

export class MatesAcceptedPage {
    fourthyEightHours:Date = new Date();

    constructor(public mates:MatesService,
                public auth:AuthService,
                private nav:NavController) {
        this.fourthyEightHours.setDate(this.fourthyEightHours.getDate() - 2);
    }

    viewMate(friendship:Friendship) {
        this.nav.push(MateViewPage, {
            mate: friendship
        });
    }

    chatWith(mate:Friendship) {
        this.nav.present(Modal.create(ChatPage, {
            mate: mate
        }));
    }
}