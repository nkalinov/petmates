import { forwardRef, Inject, Injectable } from '@angular/core';
// import { ImagePicker } from 'ionic-native';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Events } from 'ionic-angular';
import { Place } from '../models/place.model';
import { LocationService } from './location.service';
import { ApiService } from './api.service';

@Injectable()
export class PlacesService {
    nearby$ = new BehaviorSubject<Place[]>([]); // .filter(place => place.approved);
    mine$ = new BehaviorSubject<Place[]>([]);

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events,
                private location: LocationService) {
    }

    getNearbyPlaces(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.nearby$.getValue().length <= 0) {
                this.http.get(`/nearby/places?coords=${coords}`)
                    .subscribe(
                        res => {
                            const places = res.data.map(p => new Place(p));
                            this.nearby$.next(places);
                            resolve(places);
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                resolve();
            }
        });
    }

    getLocationThenNearbyPlaces(force = false) {
        if (force || this.nearby$.getValue().length <= 0) {
            return this.location.getGeolocation().then(coords => this.getNearbyPlaces(coords, force));
        } else {
            return Promise.resolve();
        }
    }

    getCreatedPlaces(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.mine$.getValue().length <= 0) {
                this.http.get(`/places`)
                    .subscribe(
                        res => {
                            this.mine$.next(res.data.map(p => new Place(p)));
                            resolve();
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                resolve();
            }
        });
    }

    updateOrCreatePlace(place: Place) {
        return new Promise((resolve, reject) => {
            if (place._id) {
                // update
                this.http.put(`/places/${place._id}`, place)
                    .subscribe(
                        res => {
                            if (res.success) {
                                // replace in mine
                                const newPlace = new Place(res.data);
                                const mineValues = this.mine$.getValue();
                                const mineIndex = mineValues.findIndex(obj => obj._id === place._id);
                                mineValues[mineIndex] = newPlace;

                                // remove from nearby (pending approval)
                                const nearbyValues = this.nearby$.getValue();
                                const nearbyIndex = nearbyValues.findIndex(obj => obj._id === place._id);
                                if (nearbyIndex > -1) {
                                    nearbyValues.splice(nearbyIndex, 1);
                                }
                                resolve();
                            } else {
                                this.events.publish('alert:error', res.msg);
                                reject();
                            }
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                // create
                this.http.post(`/places`, place)
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                this.mine$.next([
                                    ...this.mine$.getValue(),
                                    place
                                ]);
                                resolve();
                            } else {
                                this.events.publish('alert:error', res.msg);
                                reject();
                            }
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            }
        });
    }

    deletePlace(place: Place) {
        return new Promise((resolve, reject) => {
            this.http.delete(`$/places/${place._id}`)
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            // remove from mine
                            const mineValues = this.mine$.getValue();
                            const mineIndex = mineValues.indexOf(place);
                            mineValues.splice(mineIndex, 1);

                            // remove from nearby
                            const nearbyValues = this.nearby$.getValue();
                            const nearbyIndex = nearbyValues.findIndex(obj => obj._id === place._id);
                            if (nearbyIndex > -1) {
                                nearbyValues.splice(nearbyIndex, 1);
                            }
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject();
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }

    uploadPicture(place: Place) {
        // ImagePicker.getPictures({
        //     maximumImagesCount: 1,
        //     width: 500,
        //     height: 500
        // }).then(images => {
                // let options = new FileUploadOptions();
                // options.fileKey = 'picture';
                // let ft = new FileTransfer();
                // ft.upload(images[0], encodeURI(`${this.config.get('API')}/upload`),
                //     res => {
                //         const parsed = JSON.parse(res.response);
                //
                //         if (parsed.success) {
                //             place.pic = parsed.data.url;
                //             place.picture = parsed.data.filename;
                //         } else {
                //             this.events.publish('alert:error', parsed.msg);
                //         }
                //     },
                //     err => {
                //         this.events.publish('alert:error', err.body);
                //     }, options);
            // },
            // err => {
            //     this.events.publish('alert:error', err);
            // });
    }
}
