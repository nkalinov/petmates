import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ImagePicker } from 'ionic-native';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Config, Events } from 'ionic-angular';
import { AuthService } from '../pages/auth/auth.service';
import { Place } from '../models/place.model';
import { LocationService } from './location.service';

@Injectable()
export class PlacesService {
    nearby$ = new BehaviorSubject<Place[]>([]); // .filter(place => place.approved);
    mine$ = new BehaviorSubject<Place[]>([]);

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
    }

    getNearbyPlaces(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.nearby$.getValue().length <= 0) {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http.get(`${this.config.get('API')}/nearby/places?coords=${coords}`, { headers })
                    .map(res => res.json())
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
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http.get(`${this.config.get('API')}/places`, { headers })
                    .map(res => res.json())
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
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            if (place._id) {
                // update
                this.http.put(`${this.config.get('API')}/places/${place._id}`, JSON.stringify(place), { headers })
                    .map(res => res.json())
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
                this.http.post(`${this.config.get('API')}/places`, JSON.stringify(place), { headers })
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
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/places/${place._id}`, { headers })
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
        ImagePicker.getPictures({
            maximumImagesCount: 1,
            width: 500,
            height: 500
        }).then(images => {
                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = {
                    'Authorization': this.auth.token
                };
                let ft = new FileTransfer();
                ft.upload(images[0], encodeURI(`${this.config.get('API')}/upload`),
                    res => {
                        const parsed = JSON.parse(res.response);

                        if (parsed.success) {
                            place.pic = parsed.data.url;
                            place.picture = parsed.data.filename;
                        } else {
                            this.events.publish('alert:error', parsed.msg);
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.body);
                    }, options);
            },
            err => {
                this.events.publish('alert:error', err);
            });
    }
}
