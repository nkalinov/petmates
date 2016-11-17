import { Component } from '@angular/core';
import { NavController, Refresher, ModalController } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Place } from '../../../models/place.model';
import { PlaceEditPage } from './place-edit';
import { ReportPlacePage } from './report-place/report-place';
import { PlacesService } from '../../../providers/places.service';

@Component({
    templateUrl: 'places.html'
})
export class PlacesPage {
    constructor(private navCtrl: NavController,
                private modalCtrl: ModalController,
                public places: PlacesService) {
    }

    ionViewDidEnter() {
        this.onSegmentChange();
    }

    onSegmentChange(force = false) {
        if (this.places.mode === 'nearby') {
            return this.places.getNearbyPlaces(force);
        } else {
            return this.places.getCreatedPlaces();
        }
    }

    doRefresh(refresher: Refresher) {
        this.onSegmentChange(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }

    addPlace() {
        this.navCtrl.push(PlaceEditPage);
    }

    navigate(place: Place) {
        LaunchNavigator.navigate([
            place.location.coordinates[1],
            place.location.coordinates[0]
        ]).then(
            success => console.log('Launched navigator'),
            error => console.log('Error launching navigator', error)
        );
    }

    report(place) {
        this.modalCtrl.create(ReportPlacePage).present();
    }
}
