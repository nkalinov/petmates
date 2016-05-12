import {Page, IonicApp, NavParams, NavController, Alert, Modal} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {AgeInfo} from '../../../common/age';
import {GenderInfo} from '../../../common/gender';
import {PetImage} from '../../../common/pet-image';
import {MateImage} from '../../../common/mate-image';
import {MatesService} from '../../../services/mates.service';
import {Friendship} from "../../../models/friendship.interface";

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
    friendship:Friendship;

    constructor(app:IonicApp,
                navParams:NavParams,
                private mates:MatesService) {
        this.nav = app.getActiveNav();
        this.friendship = navParams.get('mate');
    }
    
    removeMate() {
        let alert = Alert.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${this.friendship.friend.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        this.mates.remove(this.friendship).subscribe((res:any) => {
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