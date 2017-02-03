import { forwardRef, Inject, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { User } from '../models/User';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';
import { ApiService } from './api.service';

@Injectable()
export class NearbyService {
    people$ = new BehaviorSubject([]);
    people: User[] = [];

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events,
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

                this.http
                    .get(`/nearby/people?coords=${coords}`)
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
