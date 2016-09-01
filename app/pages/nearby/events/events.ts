import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { EventViewPage } from './event-view';
import { Event } from '../../../models/event.model';
import { EventEditPage } from './event-edit';
import { EventsService } from '../../../services/events.service';

@Component({
    templateUrl: 'build/pages/nearby/events/events.html'
})

export class EventsPage {
    constructor(private navCtrl: NavController,
                public events: EventsService) {
    }

    ionViewDidEnter() {
        this.events.getNearbyEvents();
    }

    viewEvent(event: Event) {
        this.navCtrl.push(EventViewPage, { event });
    }

    addEvent() {
        this.navCtrl.push(EventEditPage);
    }

    doRefresh(refresher: Refresher) {
        this.events.getNearbyEvents(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
