import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../pages/auth/auth.service';
import { Config, Events } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';
import { Event } from '../models/Event';

@Injectable()
export class EventsService {
    mode: 'nearby' | 'going' | 'mine' = 'nearby';
    nearby$ = new BehaviorSubject([]);
    mine$ = new BehaviorSubject([]);
    going$ = new BehaviorSubject([]);

    _events: Array<Event> = []; // events with populated details

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private location: LocationService) {
    }

    getNearbyEvents(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.nearby$.getValue().length <= 0) {
                this.location.getGeolocation().then(coords => {
                    let headers = new Headers();
                    headers.append('Authorization', this.auth.token);

                    this.http.get(`${this.config.get('API')}/nearby/events?coords=${coords}`, { headers })
                        .map(res => res.json())
                        .subscribe(
                            res => {
                                if (res.success) {
                                    this.nearby$.next(res.data.map(p => new Event(p)));
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
            } else {
                resolve();
            }
        });
    }

    getEvents(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this[`${this.mode}$`].getValue().length <= 0) {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http.get(`${this.config.get('API')}/events?filter=${this.mode}`, { headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                this[`${this.mode}$`].next(res.data.map(obj => new Event(obj)));
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
                resolve();
            }
        });
    }

    editOrCreateEvent(event: Event) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            if (event._id) {
                // update
                this.http.put(`${this.config.get('API')}/events/${event._id}`, JSON.stringify(event), { headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                // replace details
                                const index = this._events.findIndex(obj => obj._id === event._id);
                                this._events[index] = event;

                                // refresh list
                                this.nearby$.next([]);
                                this.mine$.next([]);
                                this.going$.next([]);
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
                this.http.post(`${this.config.get('API')}/events`, JSON.stringify(event), { headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                // refresh currently visible list
                                if (this.mode === 'nearby') {
                                    this.getNearbyEvents(true).then(() => resolve());
                                } else {
                                    this.getEvents(true).then(() => resolve());
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
            }
        });
    }

    cancelEvent(id: string) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/events/${id}`, { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const index = this._events.findIndex(obj => obj._id === id);
                            this._events.splice(index, 1);

                            // will refresh on next load
                            this.nearby$.next([]);
                            this.mine$.next([]);
                            this.going$.next([]);

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

        if (index > -1 && !force) {
            return Promise.resolve(this._events[index]);
        }

        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/events/${id}`, { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const event = new Event(res.data);

                            if (index > -1) {
                                this._events[index] = event;
                            } else {
                                this._events.push(event);
                            }

                            resolve(event);
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

            this.http.post(`${this.config.get('API')}/events/${event._id}/participants/${this.auth.user._id}`, {}, { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            event.participants.push(this.auth.user);
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

    notGoing(event: Event) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            this.http.delete(`${this.config.get('API')}/events/${event._id}/participants/${this.auth.user._id}`, { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const index = event.participants.findIndex(obj => obj._id === this.auth.user._id);
                            event.participants.splice(index, 1);
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
}
