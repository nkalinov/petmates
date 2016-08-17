import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { User } from '../models/user.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Place } from '../models/place.model';

@Injectable()
export class NearbyService {
    people$ = new BehaviorSubject([]);
    places$ = new BehaviorSubject([]);

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService) {
    }

    getNearbyPeople(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.people$.value.length <= 0) {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(`${this.config.get('API')}/nearby/people`, { headers: headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            this.people$.next(
                                res.data.map(u => new User(u, this.auth.user.location.coordinates))
                            );
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

    getNearbyPlaces(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.places$.value.length <= 0) {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(`${this.config.get('API')}/nearby/places`, { headers: headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            this.places$.next(
                                res.data.map(u => new Place(u, this.auth.user.location.coordinates))
                            );
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
}

