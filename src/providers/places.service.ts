import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Place } from '../models/place.model';

@Injectable()
export class PlacesService {
    mode: string = 'nearby';
    nearby$ = new BehaviorSubject([]);
    mine$ = new BehaviorSubject([]);
    going$ = new BehaviorSubject([]);

    _places: Array<Place> = []; // events with populated details

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService) {
    }

    editOrCreatePlace(place: Place) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            if (place._id) {
                // update
                this.http.put(
                    `${this.config.get('API')}/events/${place._id}`,
                    JSON.stringify(place),
                    { headers: headers }
                )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                // replace details
                                // const index = this._places.findIndex(obj => obj._id === place._id);
                                // this._places[index] = place;

                                // refresh list
                                // this.nearby$.next([]);
                                // this.mine$.next([]);
                                // this.going$.next([]);
                            }
                            resolve();
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                // create
                this.http.post(
                    `${this.config.get('API')}/events`,
                    JSON.stringify(place),
                    { headers: headers }
                )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                // refresh currently visible list
                                // if (this.mode === 'nearby') {
                                //     this.getNearbyEvents(true).then(() => resolve());
                                // } else {
                                //     this.getEvents(true).then(() => resolve());
                                // }
                                resolve();
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
}
