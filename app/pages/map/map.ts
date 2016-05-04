import {Page, NavController, Modal, Events, Config} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../../services/auth.service';
import {WalkService, UserIcon} from '../../services/walk.service.ts';
import {WalkModal} from './walk-modal/walk-modal';
import {Walk} from "../../models/walk.interface";
import {CommonService} from "../../services/common.service";

import Marker = L.Marker;
import Map = L.Map;

@Page({
    templateUrl: 'build/pages/map/map.html'
})
export class MapPage {
    map:Map;
    marker:Marker;
    markers = {};

    private geolocationOptions = {enableHighAccuracy: true};
    private positionSubscriber:Subscription;
    private walksSubscriber:Subscription;
    private deleteInactiveInterval:any;

    constructor(private auth:AuthService,
                public walk:WalkService,
                private events:Events,
                private nav:NavController,
                private config:Config) {
        // Initial position
        Geolocation.getCurrentPosition(this.geolocationOptions).then((data) => {
            let myPosition = L.latLng(data.coords.latitude, data.coords.longitude);

            // init map
            this.map = L.map('map', {zoomControl: false}).setView(myPosition, 16);

            // use OSM
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // add my marker
            this.marker = L.marker(myPosition, {
                icon: new UserIcon({iconUrl: `${this.auth.user.pic || 'build/img/default_user.gif'}`})
            }).addTo(this.map);

            // init sockets and currentWalk object
            this.walk.init(myPosition, this.marker);

        }).then(() => {
            // Watch for position change
            this.positionSubscriber = Geolocation.watchPosition(this.geolocationOptions).subscribe((data) => {
                this.walk.setCurrentCoords(L.latLng(data.coords.latitude, data.coords.longitude));
                this.marker.setLatLng(this.walk.getCurrentCoords());
            });

            // Walks
            this.walksSubscriber = this.walk.walks$.subscribe((walks:Array<Walk>) => {
                console.log('walks$', walks);
                walks.forEach((walk) => {
                    if (this.markers[walk.id] && walk.coords !== this.markers[walk.id]) {
                        // move marker
                        this.markers[walk.id].setLatLng(walk.coords);
                    } else {
                        // add new marker to the map
                        let marker = L.marker(walk.coords, {
                                icon: new UserIcon({iconUrl: `${walk.pet.pic || 'build/img/default_pet.jpg'}`})
                            })
                            .addTo(this.map)
                            .bindPopup(`<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${CommonService.getAge(walk.pet.birthday)}`);

                        marker['_id'] = walk.id;
                        this.markers[walk.id] = marker;
                    }
                });
            });

            // remove markers of inactive users (stopped walk) every 20 sec
            // === delete difference from this.walk.walks AND this.markers
            // todo OK to do it here in setInterval ? or ^^
            this.deleteInactiveInterval = setInterval(() => {
                for (var uid in this.markers) {
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

        }, (err) => {
            this.events.publish('alert:error', 'You have disabled or no access to Geolocalization');
        });
    }

    stopWalk() {
        this.walk.stop();
    }

    onPageWillUnload() {
        console.info('MapPage onPageWillUnload');
        if (this.positionSubscriber) {
            this.positionSubscriber.unsubscribe();
        }
        if (this.walksSubscriber) {
            this.walksSubscriber.unsubscribe();
        }
        if (this.deleteInactiveInterval) {
            clearInterval(this.deleteInactiveInterval);
        }
    }

    openWalkModal() {
        this.nav.present(Modal.create(WalkModal));
    }
}
