import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { NearbyService } from '../../../services/nearby.service';
import { EventViewPage } from './event-view';
import { Event } from '../../../models/event.model';
import { EventEditPage } from './event-edit';

@Component({
    templateUrl: 'build/pages/nearby/events/events.html'
})
export class EventsPage {
    constructor(private navCtrl: NavController,
                private nearby: NearbyService) {
    }

    ionViewDidEnter() {
        this.nearby.getNearbyEvents();
    }

    viewEvent(event: Event) {
        this.navCtrl.push(EventViewPage, { event });
    }

    addEvent() {
        this.navCtrl.push(EventEditPage);
    }

    doRefresh(refresher: Refresher) {
        this.nearby.getNearbyEvents(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
