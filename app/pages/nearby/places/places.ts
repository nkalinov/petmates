import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { NearbyService } from '../../../services/nearby.service';
import { Place } from '../../../models/place.model';
import { PlaceImage } from '../../../common/place-image';
import { PlaceViewPage } from './view';

@Component({
    templateUrl: 'build/pages/nearby/places/places.html',
    directives: [PlaceImage]
})
export class PlacesPage {
    constructor(private navCtrl: NavController,
                private nearby: NearbyService) {
    }

    ionViewDidEnter() {
        this.nearby.getNearbyPlaces();
    }

    viewPlace(place: Place) {
        this.navCtrl.push(PlaceViewPage, { place });
    }

    doRefresh(refresher: Refresher) {
        this.nearby.getNearbyPlaces(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
