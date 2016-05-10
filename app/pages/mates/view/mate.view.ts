import {Page, IonicApp, NavParams, NavController, Alert, Modal} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {AgeInfo} from '../../../common/age';
import {GenderInfo} from '../../../common/gender';
import {PetImage} from '../../../common/pet-image';
import {MateImage} from '../../../common/mate-image';
import {MatesService} from '../../../services/mates.service';
import {Friendship} from "../../../models/friendship.interface";
import {ChatPage} from "../../chat/chat";

@Page({
    templateUrl: 'build/pages/mates/view/mate.view.html',
    directives: [
        forwardRef(() => GenderInfo),
        forwardRef(() => AgeInfo),
        forwardRef(() => PetImage),
        forwardRef(() => MateImage)
    ]
})

export class MateViewPage {
    nav:NavController;
    mate:Friendship;

    constructor(app:IonicApp,
                navParams:NavParams,
                private mates:MatesService) {
        this.nav = app.getActiveNav();
        this.mate = navParams.get('mate');
    }

    chatWith(mate:Friendship) {
        this.nav.present(Modal.create(ChatPage, {
            mate: mate
        }));
    }
    
    removeMate() {
        let alert = Alert.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${this.mate.friend.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        this.mates.remove(this.mate).subscribe((res:any) => {
                            if (res.success) {
                                setTimeout(() => {
                                    this.nav.pop();
                                }, 1000);
                            }
                        });
                    }
                }
            ]
        });
        this.nav.present(alert);
    }
}