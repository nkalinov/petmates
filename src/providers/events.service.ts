import { forwardRef, Inject, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';
import { Event } from '../models/Event';
import { ApiService } from './api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app/state';
import { User } from '../models/User';

@Injectable()
export class EventsService {
    mode: 'nearby' | 'going' | 'mine' = 'nearby';
    nearby$ = new BehaviorSubject([]);
    mine$ = new BehaviorSubject([]);
    going$ = new BehaviorSubject([]);
    _events: Array<Event> = []; // events with populated details
    private user: User;

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events,
                private location: LocationService,
                private store: Store<AppState>) {
        this.store.select(state => state.auth).subscribe(auth => {
            this.user = auth.user;
        });
    }

    getNearbyEvents(force = false) {
        return new Promise((resolve, reject) => {
            if (force || this.nearby$.getValue().length <= 0) {
                this.location.getGeolocation().then(coords => {

                    this.http.get(`/nearby/events?coords=${coords}`)
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
                this.http.get(`/events?filter=${this.mode}`)
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
            if (event._id) {
                // update
                this.http.put(`/events/${event._id}`, event)
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
                this.http.post(`/events`, event)
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
            this.http.delete(`/events/${id}`)
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
            this.http.get(`/events/${id}`)
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
            this.http.post(`/events/${event._id}/participants/${this.user._id}`, {})
                .subscribe(
                    res => {
                        if (res.success) {
                            event.participants.push(this.user);
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
            this.http.delete(`/events/${event._id}/participants/${this.user._id}`)
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            const index = event.participants.findIndex(obj => obj._id === this.user._id);
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
