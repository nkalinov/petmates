import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { EventViewPage } from './event-view';
import { Event } from '../../../models/Event';
import { EventEditPage } from './event-edit';
import { EventsService } from '../../../providers/events.service';

@Component({
    templateUrl: 'events.html'
})

export class NearbyEventsPage {

    constructor(private navCtrl: NavController,
                public events: EventsService) {
    }

    ionViewDidEnter() {
        this.onSegmentChange();
    }

    onSegmentChange(force = false) {
        if (this.events.mode === 'nearby') {
            return this.events.getNearbyEvents(force);
        } else {
            return this.events.getEvents(force);
        }
    }

    doRefresh(refresher: Refresher) {
        this.onSegmentChange(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }

    viewEvent(event: Event) {
        this.navCtrl.push(EventViewPage, { event });
    }

    addEvent() {
        this.navCtrl.push(EventEditPage);
    }
}
