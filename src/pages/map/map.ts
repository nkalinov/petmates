import { ModalController, Config } from 'ionic-angular';
import { Geolocation, Geoposition } from 'ionic-native';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../providers/auth.service';
import { WalkService } from '../../providers/walk.service';
import { WalkModal } from './walk-modal/walk-modal';
import { Walk } from '../../models/walk.model';
import { getAge } from '../../providers/common.service';
import { NearbyService } from '../../providers/nearby.service';
import { vetIcon, UserIcon } from '../../common/icons';
import { Place, PlaceType } from '../../models/place.model';
import { LocationService } from '../../providers/location.service';

(<any>L.Icon.Default).imagePath = '../assets/img/leaflet/';

@Component({
    selector: 'map-page',
    templateUrl: 'map.html'
})

export class MapPage {
    walks = {}; // saved walk markers by _id
    map: L.Map;
    marker: L.Marker;
    mcgLayerSupportGroup = (<any>L).markerClusterGroup.layerSupport({
        showCoverageOnHover: false
    });
    control = L.control.layers(null, null, { collapsed: false });
    layers = {
        walks: L.layerGroup([]),
        shops: L.layerGroup([]),
        vets: L.layerGroup([])
    };

    GEOaccess: boolean = true;

    private positionSubscriber: Subscription;
    private walksSubscriber: Subscription;
    private clearInactiveInterval: number;

    constructor(private auth: AuthService,
                public walk: WalkService,
                private nearby: NearbyService,
                private modalCtrl: ModalController,
                private location: LocationService,
                private config: Config) {
    }

    ionViewDidEnter() {
        const tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        });

        this.map = L.map('map-container', {
            zoomControl: false,
            layers: [tiles]
        });

        this.mcgLayerSupportGroup.addTo(this.map);

        this.initGeolocation().then(coords => {
            this.populate();
            this.addPlacesMarkers(coords);
            this.control.addTo(this.map);
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
        this.modalCtrl.create(WalkModal).present();
    }

    private initGeolocation() {
        return this.location.getGeolocation({ timeout: 10000 }).then(data => {
            this.GEOaccess = true;
            const position = L.latLng(data[1], data[0]);
            this.map.setView(position, 16);

            // add my marker
            this.marker = L.marker(position, {
                icon: new UserIcon({
                    iconUrl: `${this.auth.user.pic || this.config.get('defaultMateImage')}`,
                    className: 'my-marker'
                })
            }).addTo(this.map);

            // init currentWalk object
            this.walk.init(position, this.marker);

            // watch position
            this.positionSubscriber = Geolocation.watchPosition().subscribe(
                (data: Geoposition) => {
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
            return data;

        }, (err) => {
            this.geolocalizationErrorCb(err);
        });
    }

    private watchWalks() {
        // watch public walks and update walks
        this.walksSubscriber = this.walk.walks$.subscribe((walks: Array<Walk>) => {
            walks.forEach(walk => {
                if (walk.id !== this.walk.currentWalk.id) {
                    if (this.walks[walk.id]) {
                        // move
                        this.walks[walk.id].setLatLng(walk.coords);
                    } else {
                        // new
                        let marker = L.marker(walk.coords, {
                            icon: new UserIcon({
                                iconUrl: `${walk.pet.pic || this.config.get('defaultPetImage')}`
                            })
                        }).bindPopup(
                            `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${getAge(walk.pet.birthday)}<br>Out with ${walk.user.name}`
                        );

                        this.walks[walk.id] = marker;
                        this.layers.walks.addLayer(marker);
                        this.mcgLayerSupportGroup.refreshClusters(this.layers.walks);
                    }
                }
            });
        });

        // cluster walks
        this.mcgLayerSupportGroup.checkIn(this.layers.walks);
        this.control.addOverlay(this.layers.walks, 'Walks');
        this.layers.walks.addTo(this.mcgLayerSupportGroup);

        // Remove inactive walks interval
        this.clearInactiveInterval = <number>setInterval(() => {
            for (let uid in this.walks) {
                if (this.walks.hasOwnProperty(uid)) {
                    let key = uid;
                    let find = this.walk.walks.find((walk: Walk) => {
                        return walk.id === key;
                    });
                    if (!find) {
                        this.layers.walks.removeLayer(this.walks[uid]);
                        this.mcgLayerSupportGroup.refreshClusters(this.layers.walks);
                        delete this.walks[uid];
                    }
                }
            }
        }, this.config.get('deleteInactiveIntervalMs'));
    }

    private addPlacesMarkers(coords) {
        return this.nearby.getNearbyPlaces(coords).then(places => {
            places.forEach(place => {
                const marker = L.marker([
                    place.location.coordinates[1],
                    place.location.coordinates[0]
                ]).bindPopup(
                    `<b>${place.name}</b><br>${place.phone}<br>${place.hours}`
                );

                // todo
                // switch (place.type) {
                //     case PlaceType.Vet:
                //         marker
                //             .setIcon(vetIcon())
                //             .addTo(this.layers.vets);
                //         break;
                //     case PlaceType.Shop:
                //         marker
                //             .addTo(this.layers.shops);
                //         break;
                //     default:
                //         break;
                // }
            });

            this.mcgLayerSupportGroup.checkIn([this.layers.shops, this.layers.vets]);
            this.mcgLayerSupportGroup.addLayers([this.layers.shops, this.layers.vets]);
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
            this.layers.walks.addLayer(
                L.marker(this.getRandomLatLng(this.map), {
                    icon: new UserIcon({
                        iconUrl: `${this.config.get('defaultPetImage')}`
                    })
                })
            );
            // L.marker(this.getRandomLatLng(this.map), {
            //     icon: new UserIcon({
            //         iconUrl: `${this.config.get('defaultPetImage')}`
            //     })
            // }).addTo(this.layers.walks);
        }
    }

    private getRandomLatLng(map) {
        const bounds = map.getBounds(),
            southWest = bounds.getSouthWest(),
            northEast = bounds.getNorthEast(),
            lngSpan = northEast.lng - southWest.lng,
            latSpan = northEast.lat - southWest.lat;
        return L.latLng(
            southWest.lat + latSpan * Math.random(),
            southWest.lng + lngSpan * Math.random());
    }
}
