import { Component } from '@angular/core';
import { NavParams, LoadingController, NavController } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Event } from '../../../models/event.model';
import { AuthService } from '../../../services/auth.service';
import { EventEditPage } from './event-edit';
import { MateViewPage } from '../../mates/view/mate.view';
import { MateImage } from '../../../common/mate-image';
import { EventsService } from '../../../services/events.service';

@Component({
    templateUrl: 'build/pages/nearby/events/event-view.html',
    directives: [MateImage]
})

export class EventViewPage {
    event: Event;
    map: L.Map;
    marker: L.Marker;

    constructor(navParams: NavParams,
                private events: EventsService,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                public auth: AuthService) {
        this.event = navParams.get('event');
    }

    ionViewWillEnter() {
        const loader = this.loadingCtrl.create();
        loader.present();
        this.events
            .getEventDetails(this.event._id)
            .then(data => {
                this.event = data; // populated data
                loader.dismiss();
            }, () => this.navCtrl.pop());
    }

    ionViewDidEnter() {
        const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
        const coords = L.latLng(this.event.location.coordinates[1], this.event.location.coordinates[0]);

        this.map = L.map('event-map', {
            center: coords,
            zoom: 16,
            zoomControl: false,
            layers: [tiles]
        });

        this.marker = L.marker(coords)
            .addTo(this.map);
    }

    editEvent() {
        this.navCtrl.push(EventEditPage, { event: this.event });
    }

    viewMate(id: string) {
        this.navCtrl.push(MateViewPage, { id });
    }

    hasJoined() {
        return !!this.event.participants.find(obj => obj._id === this.auth.user._id);
    }

    joinEvent() {
        this.events.join(this.event);
    }

    notGoing() {
        this.events.notGoing(this.event);
    }

    navigate() {
        LaunchNavigator.navigate([
            this.event.location.coordinates[1],
            this.event.location.coordinates[0]
        ]);
    }
}
