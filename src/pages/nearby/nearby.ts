import { Component } from '@angular/core';
import { PeoplePage } from './people/people';
import { PlacesPage } from './places/places';
import { EventsPage } from './events/events';

@Component({
    selector: 'nearby-page',
    templateUrl: 'nearby.html'
})

export class NearbyPage {
    tab1Root = PeoplePage;
    tab2Root = PlacesPage;
    tab3Root = EventsPage;
}
