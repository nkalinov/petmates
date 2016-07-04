import { NavController, Modal, Events, Config } from 'ionic-angular';
import { BackgroundGeolocation, Geolocation } from 'ionic-native';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../services/auth.service';
import { WalkService, UserIcon } from '../../services/walk.service';
import { WalkModal } from './walk-modal/walk-modal';
import { Walk } from '../../models/walk.model';
import { CommonService } from '../../services/common.service';

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
                private events:Events,
                private nav:NavController,
                private config:Config) {
        this.initGeolocation();
    }

    private initGeolocation() {
        Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((data) => {
            this.GEOaccess = true;
            let position = L.latLng(data.coords.latitude, data.coords.longitude);

            // init map
            this.map = L.map('map', { zoomControl: false }).setView(position, 16);

            // use OSM
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // add my marker
            this.marker = L.marker(position, {
                icon: new UserIcon({ iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}` })
            }).addTo(this.map);

            // init currentWalk object
            this.walk.init(position, this.marker);

            // watch position
            this.positionSubscriber = Geolocation.watchPosition()
                .subscribe(
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
                        console.error(JSON.stringify(err));
                        // console.error('Geolocation.watchPosition', err);
                    }
                );

            this.watchWalks();
        }, (err) => {
            this.geolocalizationErrorCb(err);
        });
    }

    private initBackgroundGeolocation() {
        BackgroundGeolocation.isLocationEnabled().then((enabled) => {
            if (enabled) {
                this.GEOaccess = true;

                // https://github.com/mauron85/cordova-plugin-background-geolocation
                BackgroundGeolocation
                    .configure({
                        desiredAccuracy: 10,
                        stationaryRadius: 20,
                        distanceFilter: 30,
                        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
                        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
                    })
                    .then((location) => {
                        this.GEOaccess = true;
                        console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

                        if (!this.walk.currentWalk.started) {
                            // start walk
                            let myPosition = L.latLng(location.latitude, location.longitude);

                            // init map
                            this.map = L.map('map', { zoomControl: false }).setView(myPosition, 16);

                            // use OSM
                            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(this.map);

                            // add my marker
                            this.marker = L.marker(myPosition, {
                                icon: new UserIcon({ iconUrl: `${this.auth.user.pic || 'build/img/default_user.gif'}` })
                            }).addTo(this.map);

                            this.walk.init(myPosition, this.marker);

                        } else {
                            // update position

                            const newCoords = L.latLng(location.latitude, location.longitude);
                            // TODO emit only if newCoords are "major change"
                            // let emit = this.walk.getCurrentWalkCoords() != newCoords;
                            let emit = true;

                            // update coords and marker
                            this.walk.updateCurrentWalkCoords(newCoords, emit);
                            this.marker.setLatLng(newCoords);
                        }

                        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                        BackgroundGeolocation.finish(); // FOR IOS ONLY
                    })
                    .catch((err) => {
                        this.geolocalizationErrorCb(err);
                    });

                // update walks markers
                this.walksSubscriber = this.walk.walks$.subscribe((walks:Array<Walk>) => {
                    walks.forEach((walk:Walk) => {
                        if (walk.id !== this.walk.currentWalk.id) {
                            // if walk already on the map
                            if (this.markers[walk.id]) {
                                // move marker
                                this.markers[walk.id].setLatLng(walk.coords);
                            } else {
                                // marker popup text
                                let popupText = `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${CommonService.getAge(walk.pet.birthday)}<br>Out with ${walk.user.name}`;

                                // Add new marker to the map
                                let marker = L.marker(walk.coords, {
                                    icon: new UserIcon({ iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}` })
                                }).addTo(this.map).bindPopup(popupText);

                                // save
                                marker['_id'] = walk.id;
                                this.markers[walk.id] = marker;
                            }
                        }
                    });
                });
                this.watchWalks();

            } else {
                this.geolocalizationErrorCb();
            }
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
                            icon: new UserIcon({ iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}` })
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
}
