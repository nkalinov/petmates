import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { User } from '../models/user.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Place } from '../models/place.model';
import { LocationService } from './location.service';
import { Event } from '../models/event.model';

@Injectable()
export class NearbyService {
    people$ = new BehaviorSubject([]);
    places$ = new BehaviorSubject([]);
    events$ = new BehaviorSubject([]);
    _events: any = {};

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
    }

    getLocationThenNearbyPeople(force = false) {
        if (force || this.people$.getValue().length <= 0) {
            return this.location.getGeolocation().then(coords => this.getNearbyPeople(coords, force));
        } else {
            return Promise.resolve(this.people$.value);
        }
    }

    getNearbyPeople(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.people$.getValue().length <= 0) {

                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(
                        `${this.config.get('API')}/nearby/people?coords=${coords}`,
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
            } else {
                resolve(this.people$.value);
            }
        });
    }

    getLocationThenNearbyPlaces(force = false) {
        if (force || this.places$.getValue().length <= 0) {
            return this.location.getGeolocation().then(coords => this.getNearbyPlaces(coords, force));
        } else {
            return Promise.resolve(this.places$.value);
        }
    }

    getNearbyPlaces(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.places$.getValue().length <= 0) {

                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(
                        `${this.config.get('API')}/nearby/places?coords=${coords}`,
                        { headers: headers }
                    )
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
            } else {
                resolve(this.places$.value);
            }
        });
    }

    getNearbyEvents(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.events$.getValue().length <= 0) {

                this.location.getGeolocation().then(coords => {

                    let headers = new Headers();
                    headers.append('Authorization', this.auth.token);

                    this.http
                        .get(
                            `${this.config.get('API')}/nearby/events?coords=${coords}`,
                            { headers: headers }
                        )
                        .map(res => res.json())
                        .subscribe(
                            res => {
                                this.events$.next(res.data.map(p => {
                                    const obj = new Event(p.obj);
                                    obj.setDistance(p.dis);
                                    return obj;
                                }));
                                resolve();
                            },
                            err => {
                                this.events.publish('alert:error', err.text());
                                reject();
                            }
                        );
                });
            } else {
                resolve(this.events$.value);
            }
        });
    }

    editOrCreateEvent(event: Event) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            if (event._id) {
                this.http
                    .put(
                        `${this.config.get('API')}/nearby/events/${event._id}`,
                        JSON.stringify(event),
                        { headers: headers }
                    )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                const data: Array<Event> = this.events$.getValue();
                                let find = data.find(e => e._id === event._id);
                                if (find) {
                                    find = Object.assign(find, event);
                                }
                                this.events$.next(data);
                            }
                            resolve();
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                this.http
                    .post(
                        `${this.config.get('API')}/nearby/events`,
                        JSON.stringify(event),
                        { headers: headers }
                    )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                this.getNearbyEvents(true).then(() => resolve());
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

    getEventDetails(id: string) {
        if (this._events[id]) {
            return Promise.resolve(this._events[id]);
        }
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http
                .get(
                    `${this.config.get('API')}/nearby/events/${id}`,
                    { headers: headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            this._events[id] = new Event(res.data);
                            resolve(this._events[id]);
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
}
