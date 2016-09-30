import { Component, forwardRef } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { NearbyService } from '../../../providers/nearby.service';
import { MateViewPage } from '../../mates/view/mate.view';
import { MateImage } from '../../../common/mate-image';

@Component({
    templateUrl: 'people.html',
    directives: [
        forwardRef(() => MateImage)
    ]
})

export class PeoplePage {
    constructor(private navCtrl: NavController,
                private nearby: NearbyService) {
    }

    ionViewDidEnter() {
        this.nearby.getLocationThenNearbyPeople();
    }

    viewMate(id: string) {
        this.navCtrl.push(MateViewPage, { id });
    }

    doRefresh(refresher: Refresher) {
        this.nearby.getLocationThenNearbyPeople(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
