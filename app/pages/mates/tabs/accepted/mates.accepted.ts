import {Page, NavController, Modal, Alert} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {MateImage} from '../../../../common/mate-image';
import {MateViewPage} from "../../view/mate.view";
import {Friendship} from "../../../../models/friendship.interface";
import {MatesService} from "../../../../services/mates.service";
import {ChatPage} from "../../../chat/chat";
import {MessageTimePipe} from "../../../../pipes/message.time.pipe";
import {AuthService} from "../../../../services/auth.service";

@Page({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'build/pages/mates/tabs/accepted/mates.accepted.html',
    pipes: [MessageTimePipe]
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

    removeMate(mate:Friendship) {
        let alert = Alert.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${mate.friend.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        this.mates.remove(mate).subscribe(() => {
                        });
                    }
                }
            ]
        });
        this.nav.present(alert);
    }
}