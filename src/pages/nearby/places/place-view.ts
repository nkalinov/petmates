import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Place } from '../../../models/place.model';

@Component({
    templateUrl: 'place-view.html'
})

export class PlaceViewPage {
    place: Place;

    constructor(navParams: NavParams) {
        this.place = new Place(navParams.get('place'));
    }

    navigate() {
        LaunchNavigator.navigate([
            this.place.location.coordinates[1],
            this.place.location.coordinates[0]
        ]).then(
            success => console.log('Launched navigator'),
            error => console.log('Error launching navigator', error)
        );
    }
}
