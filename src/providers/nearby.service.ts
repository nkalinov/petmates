import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../pages/auth/auth.service';
import { Config, Events } from 'ionic-angular';
import { User } from '../models/User';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';

@Injectable()
export class NearbyService {
    people$ = new BehaviorSubject([]);
    people: User[] = [];

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
    }

    getLocationThenNearbyPeople(force = false) {
        if (force || !this.people.length) {
            return this.location.getGeolocation().then(coords => this.getNearbyPeople(coords, force));
        } else {
            return Promise.resolve();
        }
    }

    getNearbyPeople(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || !this.people.length) {

                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(`${this.config.get('API')}/nearby/people?coords=${coords}`, { headers: headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            this.people = res.data.map(u => new User(u));
                            this.people$.next(this.people);
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
