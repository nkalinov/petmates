import {NavController, Modal, Events, Config, App} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import {Component} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../../services/auth.service';
import {WalkService, UserIcon} from '../../services/walk.service';
import {WalkModal} from './walk-modal/walk-modal';
import {Walk} from '../../models/walk.interface';
import {CommonService} from '../../services/common.service';
import {ConversationsListPage} from '../chat/conversations.list';
import Marker = L.Marker;
import Map = L.Map;

@Component({
    templateUrl: 'build/pages/map/map.html'
})

export class MapPage {
    map:Map;
    marker:Marker;
    markers = {};

    private geolocationOptions = {enableHighAccuracy: true};
    private positionSubscriber:Subscription;
    private walksSubscriber:Subscription;
    private clearInactiveInterval:number;

    constructor(private auth:AuthService,
                public walk:WalkService,
                private events:Events,
                private nav:NavController,
                private app:App,
                private config:Config) {

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

            // init currentWalk object
            this.walk.init(myPosition, this.marker);

        }).then(() => {
            // watch position
            this.positionSubscriber = Geolocation.watchPosition(this.geolocationOptions).subscribe((data) => {
                let newCoords = L.latLng(data.coords.latitude, data.coords.longitude);
                // TODO emit only if newCoords are "major change"
                let emit = this.walk.getCurrentWalkCoords() != newCoords;

                // update coords and marker
                this.walk.updateCurrentWalkCoords(newCoords, emit);
                this.marker.setLatLng(this.walk.getCurrentWalkCoords());
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
                                icon: new UserIcon({iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}`})
                            }).addTo(this.map).bindPopup(popupText);

                            // save
                            marker['_id'] = walk.id;
                            this.markers[walk.id] = marker;
                        }
                    }
                });
            });
            
            this.startCleanInactive();
            
        }, (err) => {
            this.events.publish('alert:error', 'You have disabled or no access to Geolocalization');
            let nav:NavController = this.app.getRootNav();
            nav.setRoot(ConversationsListPage);
        });
    }

    onPageWillUnload() {
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

    /**
     * Remove markers of inactive users (stopped walk) every deleteInactiveIntervalMs interval
     */
    private startCleanInactive() {
        this.clearInactiveInterval = setInterval(() => {
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
    }
}
