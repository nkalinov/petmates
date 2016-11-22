import { Component } from '@angular/core';
import { NavParams, NavController, ActionSheetController, AlertController, Events } from 'ionic-angular';
import { LocationService } from '../../../providers/location.service';
import { PlacesService } from '../../../providers/places.service';
import { Place, placeTypes } from '../../../models/place.model';

@Component({
    templateUrl: 'place-edit.html'
})

export class PlaceEditPage {
    place: Place;
    map: L.Map;
    marker: L.Marker;

    placeTypes = placeTypes;

    constructor(navParams: NavParams,
                private navCtrl: NavController,
                private places: PlacesService,
                private location: LocationService,
                private events: Events,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController) {
        this.place = new Place(navParams.get('place'));
    }

    ionViewDidEnter() {
        const lastCoords = this.location.getLastCoords();

        const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });

        this.map = L.map('place-map', {
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

            this.place.setCoords([e.latlng.lng, e.latlng.lat]);
        });

        if (this.place.location && this.place.location.coordinates.length > 0) {
            const coords = L.latLng(this.place.location.coordinates[1], this.place.location.coordinates[0]);
            this.map.setView(coords, 16);
            this.addMarker(coords);
        }
    }

    save() {
        this.places.updateOrCreatePlace(this.place)
            .then(() => this.navCtrl.pop());
    }

    changePicture() {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Add Photo',
            buttons: [
                {
                    text: 'Choose Existing Photo',
                    handler: () => {
                        this.places.uploadPicture(this.place);
                    }
                },
                {
                    text: 'Set Photo from URL',
                    handler: () => {
                        this.alertCtrl.create({
                            title: 'Place photo',
                            inputs: [
                                {
                                    name: 'url',
                                    placeholder: 'URL to place photo'
                                }
                            ],
                            buttons: [
                                {
                                    text: 'Cancel',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Save',
                                    handler: data => {
                                        if (data.url && data.url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
                                            this.place.picture = this.place.pic = data.url;
                                            return true;
                                        } else {
                                            // invalid login
                                            this.events.publish('alert:error', 'Invalid URL');
                                            return false;
                                        }
                                    }
                                }
                            ]
                        }).present();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    private addMarker(latlng) {
        this.marker = L.marker(latlng, { draggable: true })
            .addTo(this.map)
            .on('dragend', () => {
                const coords = this.marker.getLatLng();
                this.place.setCoords([coords.lng, coords.lat]);
            });
    }
}
