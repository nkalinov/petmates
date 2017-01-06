import { Component } from '@angular/core';
import { NavParams, LoadingController, NavController } from 'ionic-angular';
import { LaunchNavigator } from 'ionic-native';
import { Event } from '../../../models/Event';
import { AuthService } from '../../../providers/auth.service';
import { EventEditPage } from './event-edit';
import { MateViewPage } from '../../mates/view/MateViewPage';
import { EventsService } from '../../../providers/events.service';
import { LocationService } from '../../../providers/location.service';

@Component({
    templateUrl: 'event-view.html'
})

export class EventViewPage {
    event: Event;
    map: L.Map;
    marker: L.Marker;

    constructor(navParams: NavParams,
                private events: EventsService,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                private location: LocationService,
                public auth: AuthService) {
        this.event = navParams.get('event');
    }

    ionViewWillEnter() {
        const loader = this.loadingCtrl.create();
        loader.present();

        this.events
            .getEventDetails(this.event._id)
            .then(data => {
                this.event = data;
                this.event.distance = this.event.latLng.distanceTo(
                    L.latLng(this.location.getLastCoords()[1], this.location.getLastCoords()[0])
                );
                loader.dismiss();
            }, () => this.navCtrl.pop());
    }

    ionViewDidEnter() {
        const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });
        const coords = L.latLng(this.event.location.coordinates[1], this.event.location.coordinates[0]);

        this.map = L.map('event-view-map', {
            center: coords,
            zoom: 16,
            zoomControl: false,
            layers: [tiles]
        });

        this.marker = L.marker(coords).addTo(this.map);
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
