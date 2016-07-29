import { NavController, Modal, Config } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../services/auth.service';
import { WalkService, UserIcon } from '../../services/walk.service';
import { WalkModal } from './walk-modal/walk-modal';
import { Walk } from '../../models/walk.model';
import { CommonService } from '../../services/common.service';
import { PlacesService, Place } from '../../services/places.service';
L.Icon.Default.imagePath = 'build/img/leaflet';

@Component({
    templateUrl: 'build/pages/map/map.html'
})

export class MapPage {
    walks = {}; // saved walk markers by _id
    map: L.Map;
    marker: L.Marker;
    mcgLayerSupportGroup = L.markerClusterGroup.layerSupport();
    control = L.control.layers(null, null, { collapsed: false });
    layers = {
        walks: L.layerGroup(),
        shops: L.layerGroup(),
        vets:  L.layerGroup()
    };

    GEOaccess: boolean = true;

    private positionSubscriber: Subscription;
    private walksSubscriber: Subscription;
    private clearInactiveInterval: number;

    constructor(private auth: AuthService,
                public walk: WalkService,
                private nav: NavController,
                private places: PlacesService,
                private config: Config) {
    }

    ionViewDidEnter() {
        this.map = L.map('map-container', { zoomControl: false });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.control.addTo(this.map);

        this.initGeolocation().then(() => {
            // this.map.addLayer(this.mcgLayerSupportGroup);
            this.populate();
            this.addPlacesMarkers();
            this.mcgLayerSupportGroup.addTo(this.map);
        });
    }

    ionViewDidLeave() {
        if (this.positionSubscriber) {
            // todo track position even when not on this page
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

    private initGeolocation() {
        return Geolocation.getCurrentPosition({
            timeout: 10000,
            enableHighAccuracy: true
        }).then((data) => {
            this.GEOaccess = true;
            const position = L.latLng(data.coords.latitude, data.coords.longitude);
            this.map.setView(position, 16);

            // add my marker
            this.marker = L.marker(position, {
                icon: new UserIcon({ iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}` })
            }).addTo(this.map);

            // init currentWalk object
            this.walk.init(position, this.marker);

            // watch position
            this.positionSubscriber = Geolocation.watchPosition().subscribe(
                (data) => {
                    const newCoords = L.latLng(data.coords.latitude, data.coords.longitude);
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

    private watchWalks() {
        // watch public walks and update walks
        this.walksSubscriber = this.walk.walks$.subscribe((walks: Array<Walk>) => {
            walks.forEach((walk: Walk) => {
                if (walk.id !== this.walk.currentWalk.id) {
                    if (this.walks[walk.id]) {
                        // if marker already on the map -> move it
                        this.walks[walk.id].setLatLng(walk.coords);
                    } else {
                        let marker = L.marker(walk.coords, {
                            icon: new UserIcon({
                                iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}`
                            })
                        }).bindPopup(
                            `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${CommonService.getAge(walk.pet.birthday)}<br>Out with ${walk.user.name}`
                        );

                        // save
                        // marker['_id'] = walk.id;
                        this.walks[walk.id] = marker;

                        // add to parent group
                        this.mcgLayerSupportGroup.addLayer(marker); // todo test dynamic add
                    }
                }
            });

            /**
             * Remove walks of inactive users (stopped walk) every deleteInactiveIntervalMs interval
             */
            this.clearInactiveInterval = setInterval(() => {
                for (let uid in this.walks) {
                    if (this.walks.hasOwnProperty(uid)) {
                        let key = uid;
                        let find = this.walk.walks.find((walk: Walk) => {
                            return walk.id === key;
                        });
                        if (!find) {
                            this.map.removeLayer(this.walks[uid]);
                            delete this.walks[uid];
                        }
                    }
                }
            }, this.config.get('deleteInactiveIntervalMs'));
        });
    }

    private addPlacesMarkers() {
        return this.places.getPlaces().then((places) => {
            places.vets.forEach((place: Place) => {
                L.marker(place.coords)
                    .bindPopup(
                        `<b>${place.name}</b><br>${place.phone}<br>${place.hours}`
                    )
                    .addTo(this.layers.vets);
            });

            places.shops.forEach((place: Place) => {
                L.marker(place.coords)
                    .bindPopup(
                        `<b>${place.name}</b><br>${place.phone}<br>${place.hours}`
                    )
                    .addTo(this.layers.shops);
            });

            this.mcgLayerSupportGroup.checkIn([this.layers.shops, this.layers.vets]);
            this.control.addOverlay(this.layers.shops, 'Animal shops');
            this.control.addOverlay(this.layers.vets, 'Vets');
        });
    }

    private geolocalizationErrorCb(err?) {
        if (err) {
            console.error(err);
        }
        this.walk.stop();
        this.GEOaccess = false;
    }

    private populate() {
        for (let i = 0; i < 50; i++) {
            const m = new L.Marker(this.getRandomLatLng(this.map));
            this.layers.walks.addLayer(m);
        }
        this.mcgLayerSupportGroup.checkIn(this.layers.walks);
        this.control.addOverlay(this.layers.walks, 'Walks');
    }

    private getRandomLatLng(map) {
        const bounds = map.getBounds(),
            southWest = bounds.getSouthWest(),
            northEast = bounds.getNorthEast(),
            lngSpan = northEast.lng - southWest.lng,
            latSpan = northEast.lat - southWest.lat;
        return new L.LatLng(
            southWest.lat + latSpan * Math.random(),
            southWest.lng + lngSpan * Math.random());
    }
}
