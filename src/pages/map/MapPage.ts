import { ModalController } from 'ionic-angular';
import { Geolocation, Geoposition } from 'ionic-native';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../providers/auth.service';
import { WalkService } from '../../providers/walk.service';
import { StartWalkPage } from './start-walk/StartWalkPage';
import { Walk } from '../../models/Walk';
import { getAge } from '../../utils/common';
import icons, { customMarkerIcon, userIcon, petIcon } from '../../common/icons';
import { LocationService } from '../../providers/location.service';
import { PlacesService } from '../../providers/places.service';
import { Place, PlaceType } from '../../models/place.model';

(<any>L.Icon.Default).imagePath = '../assets/img/leaflet/';

@Component({
    selector: 'map-page',
    templateUrl: 'MapPage.html'
})

export class MapPage {
    walks = {}; // saved walk markers by _id
    map: L.Map;
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
    private places$: Subscription;
    private clearInactiveInterval: any;

    constructor(private auth: AuthService,
                public walk: WalkService,
                private places: PlacesService,
                private modalCtrl: ModalController,
                private location: LocationService) {
    }

    ionViewDidEnter() {
        this.map = L.map('map-container', {
            zoomControl: false,
            layers: [
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                })
            ]
        });

        this.mcgLayerSupportGroup.addTo(this.map);

        this.init().then(() => {
            this.watch();
            this.addPlaces();
            this.initWalks();
            this.populate(); // dev
            this.control.addTo(this.map);
        }).catch(err => {
            if (err) {
                console.error(err);
            }
            this.walk.stop();
            this.GEOaccess = false;
        });
    }

    ionViewDidLeave() {
        if (this.places$) {
            this.places$.unsubscribe();
        }
        if (this.positionSubscriber) {
            // todo track position even when not on this page
            this.positionSubscriber.unsubscribe();
        }
        if (this.walksSubscriber) {
            this.walksSubscriber.unsubscribe();
        }
        clearInterval(this.clearInactiveInterval);
    }

    openWalkModal() {
        this.modalCtrl.create(StartWalkPage).present();
    }

    private init() {
        return this.location.getGeolocation({ timeout: 10000 }).then(lngLat => {
            this.GEOaccess = true;
            const position = L.latLng(lngLat[1], lngLat[0]);
            this.map.setView(position, 16); // center the map

            // create my marker and init my walk
            this.walk.init(
                position,
                L.marker(position, {
                    icon: userIcon(`${this.auth.user.pic}`, 'my-marker')
                }).addTo(this.map)
            );
        });
    }

    private watch() {
        this.positionSubscriber = Geolocation.watchPosition().subscribe(
            (data: Geoposition) => {
                this.walk.move(
                    L.latLng(data.coords.latitude, data.coords.longitude)
                );
            },
            (err) => {
                console.error('Geolocation.watchPosition', err);
            }
        );
    }

    private initWalks() {
        this.walksSubscriber = this.walk.walks$.subscribe((walks: Array<Walk>) => {
            walks.forEach(walk => {
                if (walk.id !== this.walk.walk.id) {
                    if (this.walks[walk.id]) {
                        // move marker
                        this.walks[walk.id].setLatLng(walk.coords);
                    } else {
                        // new walk
                        let marker = L
                            .marker(walk.coords, {
                                icon: petIcon(`${walk.pet.pic}`)
                            })
                            .bindPopup(
                                `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Age: ${getAge(walk.pet.birthday)}<br>Out with ${walk.user.name}`
                            );

                        this.walks[walk.id] = marker; // save
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
        this.clearInactiveInterval = setInterval(() => {
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
        }, 30 * 1000);
    }

    private addPlaces() {
        this.places$ = this.places.nearby$.subscribe((places: Place[]) => {
            places.forEach(place => {
                const marker = L.marker([
                    place.location.coordinates[1],
                    place.location.coordinates[0]
                ]).bindPopup(
                    `<b>${place.name}</b><br>${place.phone}<br>${place.hours}`
                );

                // add to corresponding layers
                place.type.forEach(type => {
                    switch (type) {
                        case PlaceType[PlaceType.vet]:
                            marker
                                .setIcon(customMarkerIcon(icons.vet))
                                .addTo(<any>this.layers.vets);
                            break;
                        case PlaceType[PlaceType.shop]:
                            marker
                                .addTo(<any>this.layers.shops);
                            break;
                        default:
                            break;
                    }
                });
            });

            const layers = [this.layers.shops, this.layers.vets];
            this.mcgLayerSupportGroup.checkIn([...layers]);
            this.mcgLayerSupportGroup.addLayers([...layers]);
            this.control.addOverlay(this.layers.shops, 'Animal shops');
            this.control.addOverlay(this.layers.vets, 'Vets');
        });

        this.places.getNearbyPlaces(this.location.getLastCoords());
    }


    private populate() {
        for (let i = 0; i < 50; i++) {
            this.layers.walks.addLayer(
                L.marker(this.getRandomLatLng(this.map), {
                    icon: petIcon(null)
                })
            );
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
