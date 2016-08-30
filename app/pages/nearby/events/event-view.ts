import { Component } from '@angular/core';
import { NavParams, LoadingController, NavController } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Event } from '../../../models/event.model';
import { NearbyService } from '../../../services/nearby.service';
import { AuthService } from '../../../services/auth.service';
import { EventEditPage } from './event-edit';

@Component({
    templateUrl: 'build/pages/nearby/events/event-view.html'
})

export class EventViewPage {
    event: Event;

    constructor(navParams: NavParams,
                private nearby: NearbyService,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                public auth: AuthService) {
        this.event = navParams.get('event');
    }

    ionViewWillEnter() {
        const loader = this.loadingCtrl.create();
        loader.present();
        this.nearby
            .getEventDetails(this.event._id)
            .then(data => {
                this.event = data; // populated data
                loader.dismiss();
            });
    }

    editEvent() {
        this.navCtrl.push(EventEditPage, { event: this.event });
    }

    navigate() {
        LaunchNavigator.navigate([
            this.event.location.coordinates[1],
            this.event.location.coordinates[0]
        ]);
    }
}
