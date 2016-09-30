import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { EventViewPage } from './event-view';
import { Event } from '../../../models/event.model';
import { EventEditPage } from './event-edit';
import { EventsService } from '../../../providers/events.service';

@Component({
    templateUrl: 'events.html'
})

export class EventsPage {

    constructor(private navCtrl: NavController,
                public events: EventsService) {
    }

    ionViewDidEnter() {
        this.onSegmentChange();
    }

    onSegmentChange() {
        if (this.events.mode === 'nearby') {
            this.events.getNearbyEvents();
        } else {
            this.events.getEvents();
        }
    }

    viewEvent(event: Event) {
        this.navCtrl.push(EventViewPage, { event });
    }

    addEvent() {
        this.navCtrl.push(EventEditPage);
    }

    doRefresh(refresher: Refresher) {
        if (this.events.mode === 'nearby') {
            this.events.getNearbyEvents(true).then(
                () => refresher.complete(),
                err => refresher.complete()
            );
        } else {
            this.events.getEvents(true).then(
                () => refresher.complete(),
                err => refresher.complete()
            );
        }
    }
}