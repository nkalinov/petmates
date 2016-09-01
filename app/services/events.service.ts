import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';
import { Event } from '../models/event.model';

@Injectable()
export class EventsService {
    events$ = new BehaviorSubject([]);
    _events: Array<Event> = []; // events with populated details

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
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
                                this._events = res.data.map(p => {
                                    const obj = new Event(p.obj);
                                    obj.setDistance(p.dis);
                                    return obj;
                                });
                                this.events$.next(this._events);
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
            headers.append('Content-Type', 'application/json');

            if (event._id) {
                this.http.put(
                    `${this.config.get('API')}/events/${event._id}`,
                    JSON.stringify(event),
                    { headers: headers }
                )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                const index = this._events.findIndex(obj => obj._id === event._id);
                                Object.assign(this._events[index], event);
                                this.events$.next(this._events);
                            }
                            resolve();
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                this.http.post(
                    `${this.config.get('API')}/events`,
                    JSON.stringify(event),
                    { headers: headers }
                )
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                // refresh list as we don't know where it will be added in events$
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

    cancelEvent(id: string) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.delete(
                `${this.config.get('API')}/events/${id}`,
                { headers: headers }
            )
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const index = this._events.findIndex(obj => obj._id === id);
                            this._events.splice(index, 1);
                            this.events$.next(this._events);
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
        });
    }

    getEventDetails(id: string, force = false) {
        const index = this._events.findIndex(obj => obj._id === id);

        if (this._events[index].populated && !force) {
            return Promise.resolve(this._events[index]);
        }

        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(
                `${this.config.get('API')}/events/${id}`,
                { headers: headers }
            )
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            Object.assign(this._events[index], res.data);
                            this._events[index].populated = true;
                            resolve(this._events[index]);
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

    join(event: Event) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            this.http
                .post(
                    `${this.config.get('API')}/events/${event._id}/participants/${this.auth.user._id}`,
                    {},
                    { headers: headers }
                )
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            event.participants.push(this.auth.user);
                            resolve();
                        }
                        resolve();
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }

    notGoing(event: Event) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            this.http
                .delete(
                    `${this.config.get('API')}/events/${event._id}/participants/${this.auth.user._id}`,
                    { headers: headers }
                )
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const index = event.participants.findIndex(obj => obj._id === this.auth.user._id);
                            event.participants.splice(index, 1);
                            resolve();
                        }
                        resolve();
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }
}
