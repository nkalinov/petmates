import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Events, Config} from 'ionic-angular';
import {Subject} from 'rxjs/Subject';
import {User} from '../models/user.model.ts';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs/Observable';
import {Friendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING} from '../models/friendship.interface';
import {SocketService} from './socket.service';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class MatesService {
    search$ = new Subject();
    pending$ = new BehaviorSubject(0);
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };

    constructor(private http:Http,
                private events:Events,
                private config:Config,
                private auth:AuthService,
                private sockets:SocketService) {
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

    add(friend:User):Observable {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/mates`, JSON.stringify({mate: friend._id}), {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        if (res.data) {
                            // "populate"
                            res.data.myRequest.friend = friend;
                            res.data.fRequest.friend = this.auth.user;

                            // see if request exists
                            let index = this.auth.user.mates.findIndex((friendship:Friendship) => {
                                return friendship._id === res.data.myRequest._id;
                            });
                            // if yes --> we are accepting pending request
                            if (index > -1) {
                                // replace
                                this.auth.user.mates[index] = res.data.myRequest;
                                this.sockets.socket.emit('mate:accepted', res.data);
                            } else {
                                // we are sending new request
                                this.auth.user.mates.push(res.data.myRequest);

                                // notify other side
                                this.sockets.socket.emit('mate:requested', res.data);
                            }
                            this.sortMatesByStatus();
                        }
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

    remove(friendship:Friendship):Observable {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.delete(`${this.config.get('API')}/mates/${friendship._id}`, {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        let index = this.auth.user.mates.findIndex((f:Friendship) => {
                            return f._id === friendship._id;
                        });
                        if (index > -1) {
                            this.auth.user.mates.splice(index, 1);
                            this.sockets.socket.emit('mate:remove', res.data);
                            this.sortMatesByStatus();
                        }
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

    sortMatesByStatus() {
        setTimeout(() => {
            this.mates.accepted = this.auth.user.mates.filter((f:Friendship) => {
                return f.status === STATUS_ACCEPTED;
            });
            this.mates.requested = this.auth.user.mates.filter((f:Friendship) => {
                return f.status === STATUS_REQUESTED;
            });
            this.mates.pending = this.auth.user.mates.filter((f:Friendship) => {
                return f.status === STATUS_PENDING;
            });
            this.pending$.next(this.mates.pending.length);
            console.debug('sortMatesByStatus', this.mates);
        }, 0);
    }

    registerSocketEvents(socket) {
        // someone sent me friend request
        socket.on('mate:pending', (data:any) => {
            console.info('mate:pending', data);
            this.auth.user.mates.push(data.fRequest);
            this.sortMatesByStatus();
        });

        // accepted my request
        socket.on('mate:accepted', (data:any) => {
            console.info('mate:accepted', data);
            let index = this.auth.user.mates.findIndex((f) => {
                return f._id === data.fRequest._id;
            });
            if (index > -1) {
                this.auth.user.mates[index] = data.fRequest;
            }
            this.sortMatesByStatus();
        });

        // removed my request
        socket.on('mate:remove', (data:any) => {
            console.info('mate:remove', data);
            let index = this.auth.user.mates.findIndex((f) => {
                return f._id === data.fRequest._id;
            });
            if (index > -1) {
                this.auth.user.mates.splice(index, 1);
            }
            this.sortMatesByStatus();
        });
    }
}