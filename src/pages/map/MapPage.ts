import { ModalController } from 'ionic-angular';
import { Geolocation, Geoposition } from 'ionic-native';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { WalkService } from '../../providers/walk.service';
import { StartWalkPage } from './start-walk/StartWalkPage';
import { Walk } from '../../models/Walk';
import icons, { customMarkerIcon, petIcon } from '../../utils/icons';
import { LocationService } from '../../providers/location.service';
import { PlacesService } from '../../providers/places.service';
import { Place, PlaceType } from '../../models/place.model';

(<any>L.Icon.Default).imagePath = '../assets/img/leaflet/';

@Component({
    selector: 'map-page',
    templateUrl: 'MapPage.html'
})

export class MapPage {
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
    private placesSubscriber: Subscription;

    constructor(public walk: WalkService,
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
            // this.populate(); // dev
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
        if (this.placesSubscriber) {
            this.placesSubscriber.unsubscribe();
        }
        if (this.positionSubscriber) {
            // todo track position even when not on this page
            this.positionSubscriber.unsubscribe();
        }
        if (this.walksSubscriber) {
            this.walksSubscriber.unsubscribe();
        }
    }

    openWalkModal() {
        this.modalCtrl.create(StartWalkPage).present();
    }

    private init() {
        return this.location.getGeolocation().then(lngLat => {
            this.GEOaccess = true;
            const position = L.latLng(lngLat[1], lngLat[0]);
            this.map.setView(position, 16); // center the map

            // create my marker and init my walk
            this.walk.init(position).addTo(this.map);
        });
    }

    private watch() {
        this.positionSubscriber = Geolocation.watchPosition({
            enableHighAccuracy: true
        }).subscribe(
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
        this.walksSubscriber = this.walk.walks$.subscribe((walks: Walk[]) => {
            walks.forEach(walk => {
                if (walk.id !== this.walk.walk.id) {
                    // add and save markers
                    walk.marker = L.marker(walk.coords, {
                        icon: petIcon(`${walk.pet.pic}`)
                    }).bindPopup(
                        `<b>${walk.pet.name}</b><br>${walk.pet.breed.name}<br>Out with ${walk.user.name}`
                    );

                    this.layers.walks.addLayer(walk.marker); // add to map
                    this.mcgLayerSupportGroup.refreshClusters(this.layers.walks);
                }
            });
        });
        this.walk.requestWalks();

        // cluster walks
        this.mcgLayerSupportGroup.checkIn(this.layers.walks);
        this.control.addOverlay(this.layers.walks, 'Walks');
        this.layers.walks.addTo(this.mcgLayerSupportGroup);
    }

    private addPlaces() {
        this.placesSubscriber = this.places.nearby$.subscribe((places: Place[]) => {
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
