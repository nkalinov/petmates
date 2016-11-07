import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';
import { Event } from '../../../models/event.model';
import { LocationService } from '../../../providers/location.service';
import { MateViewPage } from '../../mates/view/mate.view';
import { localISO } from '../../../providers/common.service';
import { EventsService } from '../../../providers/events.service';

@Component({
    templateUrl: 'event-edit.html'
})

export class EventEditPage {
    event: Event;
    map: L.Map;
    marker: L.Marker;
    min: string;
    max: string;

    constructor(navParams: NavParams,
                private navCtrl: NavController,
                private events: EventsService,
                private location: LocationService,
                private alertCtrl: AlertController) {
        this.event = new Event(navParams.get('event'));

        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        this.min = `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        this.max = (now.getFullYear() + 1).toString();

        if (this.event._id) {
            // convert to local ISO (for <datetime /> component)
            this.event.date = localISO(this.event.date);
        }
    }

    ionViewDidEnter() {
        const lastCoords = this.location.getLastCoords();

        const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });

        this.map = L.map('event-edit-map', {
            center: L.latLng(lastCoords[1], lastCoords[0]),
            zoom: 16,
            zoomControl: false,
            layers: [tiles]
        }).on('click', (e: any) => {
            e.originalEvent.preventDefault();

            if (this.marker) {
                this.marker.setLatLng(e.latlng);
            } else {
                this.addMarker(e.latlng);
            }

            this.event.setCoords([e.latlng.lng, e.latlng.lat]);
        });

        if (this.event.location && this.event.location.coordinates.length > 0) {
            const coords = L.latLng(this.event.location.coordinates[1], this.event.location.coordinates[0]);
            this.map.setView(coords, 16);
            this.addMarker(coords);
        }
    }

    viewMate(id: string) {
        this.navCtrl.push(MateViewPage, { id });
    }

    save() {
        this.events.editOrCreateEvent(this.event)
            .then(() => this.navCtrl.pop());
    }

    cancelEvent() {
        const alert = this.alertCtrl.create({
            title: 'Are you sure?',
            message: `Remove ${this.event.name} ?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.events.cancelEvent(this.event._id)
                            .then(() => alert.dismiss())
                            .then(() => this.navCtrl.popToRoot());
                    }
                }
            ]
        });
        alert.present();
    }

    private addMarker(latlng) {
        this.marker = L.marker(latlng, { draggable: true })
            .addTo(this.map)
            .on('dragend', () => {
                const coords = this.marker.getLatLng();
                this.event.setCoords([coords.lng, coords.lat]);
            });
    }
}
