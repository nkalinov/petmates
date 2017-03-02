import { forwardRef, Inject, Injectable } from '@angular/core';
import { Geolocation, Geoposition } from 'ionic-native';
import { Http } from '@angular/http';
import { Events } from 'ionic-angular';
import { AuthService } from '../pages/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AppState } from '../app/state';
import { Store } from '@ngrx/store';
import { User } from '../models/User';

@Injectable()
export class LocationService {
    coords$;
    private coords = new BehaviorSubject([]);
    private user: User;

    constructor(private http: Http,
                private events: Events,
                private store: Store<AppState>) {

        this.coords$ = this.coords.asObservable();
        this.store.select(state => state.auth).subscribe(auth => {
            this.user = auth.user;
        });
    }

    getLastCoords() {
        return this.coords.getValue().length
            ? this.coords.getValue()
            : this.user.location.coordinates;
    }

    getGeolocation(opts?: any): Promise<L.LatLngTuple> {
        return new Promise((resolve) => {
            if (this.coords.getValue().length) {
                resolve(this.coords.getValue()); // return last coords
            } else {
                Geolocation.getCurrentPosition(Object.assign({
                    enableHighAccuracy: true,
                    timeout: 5000
                }, opts)).then(
                    data => {
                        const coords = [data.coords.longitude, data.coords.latitude];
                        this.coords.next(coords);
                        resolve(coords);
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        resolve(this.getLastCoords());
                    });
            }
        });
    }

    // watch() {
    //     return Observable.create(observer => {
    //         const watch = Geolocation.watchPosition()
    //             .debounce(() => Observable.interval(1000))
    //             .subscribe(
    //                 (data: Geoposition) => {
    //                     this.coords.next([data.coords.latitude, data.coords.longitude]);
    //                 },
    //                 (err) => {
    //                     console.error('Geolocation.watchPosition', err);
    //                 }
    //             );
    //         return () => {
    //             watch.unsubscribe();
    //         };
    //     });
    // }

    getLocation(): Promise<{
        city?: string;
        region?: string;
        country?: string;
        coordinates?: Array<number>;
    }> {
        return new Promise((resolve, reject) => {
            this.getGeolocation().then(data => {
                const location: any = {
                    coordinates: data
                };
                this.http
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data[1]},${data[0]}&key=AIzaSyAj2LrPi4ccm8TmfHEW7l0B4HvwM6q9-K0`)
                    .map(res => res.json())
                    .subscribe(res => {
                        res.results[0]['address_components'].map((item) => {
                            if (item.types[0] === 'administrative_area_level_1') {
                                location.city = item.long_name;
                            }
                            if (item.types[0] === 'locality') {
                                location.region = item.long_name;
                            }
                            if (item.types[0] === 'country') {
                                location.country = item.long_name;
                            }
                        });
                    }, err => {
                        // Google API LIMIT probably reached
                        // todo something
                        // location.city = this.auth.user.city;
                        // location.region = this.auth.user.region;
                        // location.country = this.auth.user.country;
                    }, () => resolve(location));
            });
        });
    }
}
