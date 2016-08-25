import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { User } from '../models/user.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Place } from '../models/place.model';
import { LocationService } from './location.service';

@Injectable()
export class NearbyService {
    people$ = new BehaviorSubject([]);
    places$ = new BehaviorSubject([]);

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
    }

    getNearbyPeople(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.people$.value.length <= 0) {

                this.location.getGeolocation().then(coords => {

                    let headers = new Headers();
                    headers.append('Authorization', this.auth.token);

                    this.http
                        .post(
                            `${this.config.get('API')}/nearby/people`,
                            JSON.stringify({ coords }),
                            { headers: headers }
                        )
                        .map(res => res.json())
                        .subscribe(
                            res => {
                                const data = res.data.map(u => {
                                    const user = new User(u);
                                    user.setDistance(u.distance);
                                    return user;
                                });
                                this.people$.next(data);
                                resolve(data);
                            },
                            err => {
                                this.events.publish('alert:error', err.text());
                                reject();
                            }
                        );
                });
            } else {
                resolve(this.people$.value);
            }
        });
    }

    getNearbyPlaces(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.places$.value.length <= 0) {

                this.location.getGeolocation().then(coords => {

                    let headers = new Headers();
                    headers.append('Authorization', this.auth.token);

                    this.http
                        .post(
                            `${this.config.get('API')}/nearby/places`,
                            JSON.stringify({ coords }),
                            { headers: headers })
                        .map(res => res.json())
                        .subscribe(
                            res => {
                                const data = res.data.map(p => {
                                    const place = new Place(p.obj);
                                    place.setDistance(p.dis);
                                    return place;
                                });
                                this.places$.next(data);
                                resolve(data);
                            },
                            err => {
                                this.events.publish('alert:error', err.text());
                                reject();
                            }
                        );
                });
            } else {
                resolve(this.places$.value);
            }
        });
    }
}
