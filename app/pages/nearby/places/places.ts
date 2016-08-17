import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { NearbyService } from '../../../services/nearby.service';
import { MateViewPage } from '../../mates/view/mate.view';
import { Place } from '../../../models/place.model';

@Component({
    templateUrl: 'build/pages/nearby/places/places.html',
})
export class PlacesPage {
    constructor(private navCtrl: NavController,
                private nearby: NearbyService) {
    }

    ionViewDidEnter() {
        this.nearby.getNearbyPlaces();
    }

    viewPlace(place: Place) {
        // this.navCtrl.push(MateViewPage, { mate });
    }

    doRefresh(refresher: Refresher) {
        this.nearby.getNearbyPlaces(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
