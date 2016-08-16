import { Component } from '@angular/core';
import { PeoplePage } from './people/people';
import { PlacesPage } from './places/places';
import { NearbyService } from '../../services/nearby.service';

@Component({
    templateUrl: 'build/pages/nearby/nearby.html',
    providers: [NearbyService]
})

export class NearbyPage {
    tab1Root = PeoplePage;
    tab2Root = PlacesPage;

    constructor() {
    }
}
