import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Events, Config} from 'ionic-angular';
import {Subject} from 'rxjs/Subject';
import {User} from '../models/user.model.ts';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs/Observable';
import {Friendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING} from "../models/friendship.interface";

@Injectable()
export class MatesService {
    search$ = new Subject();
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };

    constructor(private http:Http,
                private events:Events,
                private config:Config,
                private auth:AuthService) {
        this.sortMatesByStatus();
    }

    search(q):void {
        if (q && q !== '') {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/mates/search`, {
                search: 'q=' + q,
                headers: headers
            }).subscribe((res:any) => {
                res = res.json();
                res.data.map(u => new User(u));
                this.search$.next(res.data);
            }, (err) => {
                this.events.publish('alert:error', err.text());
            });
        }
    }

    /**
     * Add mate
     * @param mate
     * @returns {Observable}
     */
    add(mate:User) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/mates`, JSON.stringify({mate: mate._id}), {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        // see if request exists
                        let index = this.auth.user.mates.findIndex((friendship:Friendship) => {
                            return friendship._id === res.data._id;
                        });

                        // if yes --> we have accepted the request
                        if (index > -1) {
                            // replace
                            this.auth.user.mates[index] = res.data;
                        } else {
                            // new request
                            this.auth.user.mates.push(res.data);
                        }

                        this.sortMatesByStatus();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                    observer.next(res);
                    observer.complete();
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err);
                    observer.complete();
                }
            );
        });
    }

    remove(mate:Friendship) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.delete(`${this.config.get('API')}/mates/${mate._id}`, {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        let index = this.auth.user.mates.findIndex((friendship) => {
                            return friendship._id === mate._id;
                        });
                        if (index > -1) {
                            this.auth.user.mates.splice(index, 1);
                        }
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                    this.sortMatesByStatus();
                    observer.next(res);
                    observer.complete();
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err);
                    observer.complete();
                }
            );
        });
    }

    private sortMatesByStatus() {
        this.mates.accepted = this.auth.user.mates.filter((f:Friendship) => {
            return f.status === STATUS_ACCEPTED;
        });
        this.mates.requested = this.auth.user.mates.filter((f:Friendship) => {
            return f.status === STATUS_REQUESTED;
        });
        this.mates.pending = this.auth.user.mates.filter((f:Friendship) => {
            return f.status === STATUS_PENDING;
        });
    }
}