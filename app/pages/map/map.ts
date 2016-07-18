import {NavController, Modal, Config} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import {Component} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../../services/auth.service';
import {WalkService, UserIcon} from '../../services/walk.service';
import {WalkModal} from './walk-modal/walk-modal';
import {Walk} from '../../models/walk.model';
import {CommonService} from '../../services/common.service';
import {PlacesService, Place} from '../../services/places.service';

@Component({
    templateUrl: 'build/pages/map/map.html'
})

export class MapPage {
    map:L.Map;
    marker:L.Marker;
    markers = {};
    GEOaccess:boolean = true;

    private positionSubscriber:Subscription;
    private walksSubscriber:Subscription;
    private clearInactiveInterval:number;

    constructor(private auth:AuthService,
                public walk:WalkService,
                private nav:NavController,
                private places:PlacesService,
                private config:Config) {
        // init map
        this.map = L.map('map', {zoomControl: false});

        // use OSM
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // add public markers
        this.addPlacesMarkers();

        // geolocalize me
        this.initGeolocation();
    }

    private initGeolocation() {
        Geolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then((data) => {
            this.GEOaccess = true;
            let position = L.latLng(data.coords.latitude, data.coords.longitude);

            // center map
            this.map.setView(position, 16);

            // add my marker
            this.marker = L.marker(position, {
                icon: new UserIcon({iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`})
            }).addTo(this.map);

            // init currentWalk object
            this.walk.init(position, this.marker);

            // watch position
            this.positionSubscriber = Geolocation.watchPosition().subscribe(
                (data) => {
                    let newCoords = L.latLng(data.coords.latitude, data.coords.longitude);
                    // TODO emit only if newCoords are "major change"
                    // let emit = this.walk.getCurrentWalkCoords() != newCoords;
                    let emit = true;

                    // update coords and marker
                    this.walk.updateCurrentWalkCoords(newCoords, emit);
                    this.marker.setLatLng(this.walk.getCurrentWalkCoords());
                },
                (err) => {
                    console.error('Geolocation.watchPosition', err);
                }
            );

            this.watchWalks();
        }, (err) => {
            this.geolocalizationErrorCb(err);
        });
    }

    ionViewWillUnload() {
        if (this.positionSubscriber) {
            this.positionSubscriber.unsubscribe();
        }
        if (this.walksSubscriber) {
            this.walksSubscriber.unsubscribe();
        }
        if (this.clearInactiveInterval) {
            clearInterval(this.clearInactiveInterval);
        }
    }

    openWalkModal() {
        this.nav.present(Modal.create(WalkModal));
    }

    private watchWalks() {
        // watch public walks and update markers
        this.walksSubscriber = this.walk.walks$.subscribe((walks:Array<Walk>) => {
            walks.forEach((walk:Walk) => {
                if (walk.id !== this.walk.currentWalk.id) {
                    // if walk already on the map
                    if (this.markers[walk.id]) {
                        // move marker
                        this.markers[walk.id].setLatLng(walk.coords);
                    } else {
                        // Add new marker to the map
                        let marker = L.marker(walk.coords, {
                            icon: new UserIcon({iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}`})
                        }).addTo(this.map).bindPopup(
                            `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${CommonService.getAge(walk.pet.birthday)}<br>Out with ${walk.user.name}`
                        );

                        // save
                        marker['_id'] = walk.id;
                        this.markers[walk.id] = marker;
                    }
                }
            });

            /**
             * Remove markers of inactive users (stopped walk) every deleteInactiveIntervalMs interval
             */
            this.clearInactiveInterval = setInterval(() => {
                for (let uid in this.markers) {
                    if (this.markers.hasOwnProperty(uid)) {
                        let key = uid;
                        let find = this.walk.walks.find((walk:Walk) => {
                            return walk.id === key;
                        });
                        if (!find) {
                            this.map.removeLayer(this.markers[uid]);
                            delete this.markers[uid];
                        }
                    }
                }
            }, this.config.get('deleteInactiveIntervalMs'));
        });
    }

    private geolocalizationErrorCb(err?) {
        if (err) {
            console.error(err);
        }
        this.walk.stop();
        this.GEOaccess = false;
    }

    private addPlacesMarkers() {
        const shops = new L.LayerGroup();
        const vets = new L.LayerGroup();

        this.places.getPlaces().then((places) => {

            places.vets.forEach((place:Place) => {
                L.marker(place.coords)
                    .bindPopup(
                        `<b>${place.name}</b><br>Tel: ${place.phone}<br>Open: ${place.hours}`
                    )
                    .addTo(vets);
            });

            places.shops.forEach((place:Place) => {
                L.marker(place.coords)
                    .bindPopup(
                        `<b>${place.name}</b><br>Tel: ${place.phone}<br>Open: ${place.hours}`
                    )
                    .addTo(shops);
            });

            L.control.layers({
                'Vets': vets,
                'Shops': shops
            }).addTo(this.map);
        });
    }
}
