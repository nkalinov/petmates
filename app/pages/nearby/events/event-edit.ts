import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Event } from '../../../models/event.model';
import { NearbyService } from '../../../services/nearby.service';

@Component({
    templateUrl: 'build/pages/nearby/events/event-edit.html'
})

export class EventEditPage {
    event: Event;

    constructor(navParams: NavParams,
                public viewCtrl: ViewController,
                private nearby: NearbyService) {
        this.event = new Event(navParams.get('event'));
    }

    save() {
        this.nearby.editOrCreateEvent(this.event).then(res => {
            this.viewCtrl.dismiss();
        });
    }
}
