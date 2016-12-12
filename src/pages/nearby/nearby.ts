import { Component } from '@angular/core';
import { NearbyPeoplePage } from './people/people';
import { NearybyPlacesPage } from './places/places';
import { NearbyEventsPage } from './events/events';
import { NearbyPetsPage } from './pets/pets';

@Component({
    selector: 'nearby-page',
    templateUrl: 'nearby.html'
})

export class NearbyPage {
    PetsTab = NearbyPetsPage;
    PeopleTab = NearbyPeoplePage;
    PlacesTab = NearybyPlacesPage;
    EventsTab = NearbyEventsPage;
}
