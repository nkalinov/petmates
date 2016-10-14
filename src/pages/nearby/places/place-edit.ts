import { Component } from '@angular/core';
import { NavParams, NavController, ModalController } from 'ionic-angular';
import { LocationService } from '../../../providers/location.service';
import { MateViewPage } from '../../mates/view/mate.view';
import { MateImage } from '../../../common/mate-image';
import { PlacesService } from '../../../providers/places.service';
import { Place, PlaceType } from '../../../models/place.model';
import { ReportPlacePage } from './report-place/report-place';

@Component({
    templateUrl: 'place-edit.html',
    directives: [MateImage]
})

export class PlaceEditPage {
    place: Place;
    map: L.Map;
    marker: L.Marker;
    min: string;
    max: string;
    placeTypes = PlaceType;

    constructor(navParams: NavParams,
                private navCtrl: NavController,
                private places: PlacesService,
                private location: LocationService,
                private modalCtrl: ModalController) {
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

    viewMate(id: string) {
        this.navCtrl.push(MateViewPage, { id });
    }

    save() {
        this.places.editOrCreatePlace(this.place)
            .then(() => this.navCtrl.pop());
    }

    reportPlace() {
        this.modalCtrl.create(ReportPlacePage).present();
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
