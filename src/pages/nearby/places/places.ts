import { Component } from '@angular/core';
import { NavController, Refresher, ModalController, AlertController } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Place } from '../../../models/place.model';
import { PlaceEditPage } from './place-edit';
import { ReportPlacePage } from './report-place/report-place';
import { PlacesService } from '../../../providers/places.service';

@Component({
    templateUrl: 'places.html'
})
export class PlacesPage {
    mode: 'nearby' | 'mine' = 'nearby';

    constructor(private navCtrl: NavController,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                public places: PlacesService) {
    }

    ionViewDidEnter() {
        this.onSegmentChange();
    }

    onSegmentChange(force = false) {
        if (this.mode === 'nearby') {
            return this.places.getLocationThenNearbyPlaces(force);
        } else {
            return this.places.getCreatedPlaces(force);
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

    editPlace(place: Place) {
        this.navCtrl.push(PlaceEditPage, { place });
    }

    deletePlace(place: Place) {
        const alert = this.alertCtrl.create({
            title: 'Confirm place deletion',
            message: 'Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.places.deletePlace(place).then(() => alert.dismiss());
                    }
                }
            ]
        });
        alert.present();
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
