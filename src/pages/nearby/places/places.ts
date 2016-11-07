import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { NearbyService } from '../../../providers/nearby.service';
import { Place } from '../../../models/place.model';
import { PlaceViewPage } from './place-view';
import { PlaceEditPage } from './place-edit';

@Component({
    templateUrl: 'places.html'
})
export class PlacesPage {
    constructor(private navCtrl: NavController,
                public nearby: NearbyService) {
    }

    ionViewDidEnter() {
        this.nearby.getLocationThenNearbyPlaces();
    }

    viewPlace(place: Place) {
        this.navCtrl.push(PlaceViewPage, { place });
    }

    addPlace() {
        this.navCtrl.push(PlaceEditPage);
    }

    doRefresh(refresher: Refresher) {
        this.nearby.getLocationThenNearbyPlaces(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
