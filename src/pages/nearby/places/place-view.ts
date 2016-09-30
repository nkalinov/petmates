import { Component } from '@angular/core';
import { NavParams, Config } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { PlaceImage } from '../../../common/place-image';
import { Place } from '../../../models/place.model';

@Component({
    templateUrl: 'place-view.html',
    directives: [PlaceImage]
})

export class PlaceViewPage {
    place: Place;

    constructor(navParams: NavParams,
                config: Config) {
        this.place = new Place(navParams.get('place'));

        if (!this.place.pic) {
            this.place.pic = this.place.type === 'vet' ?
                config.get('defaultVetCardImage') :
                config.get('defaultShopCardImage');
        }
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
