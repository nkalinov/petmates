import { LocalNotifications } from 'ionic-native';
import { Events, Config } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { User } from '../models/user.model.ts';
import { AuthService } from './auth.service';
import { Friendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING } from '../models/friendship.interface';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MatesService {
    search$ = new Subject();
    pending$ = new BehaviorSubject(0);
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };
    users = {}; // cache

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private sockets: SocketService) {
    }

    getById(id: string) {
        return new Promise((resolve, reject) => {
            if (this.users[id]) {
                return resolve(this.users[id]);
            }

            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/user/${id}`, {
                headers: headers
            }).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        const user = new User(res.data, this.auth.user.location.coordinates);
                        this.users[id] = user;
                        resolve(user);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                err => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });

    }

    search(event): void {
        let value = event.target.value.trim();

        if (value && value !== '') {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/mates/search`, {
                search: `q=${value}`,
                headers: headers
            }).map(res => res.json()).subscribe((res: any) => {
                this.search$.next(
                    res.data.map(u => new User(u, this.auth.user.location.coordinates))
                );
            }, (err) => {
                this.events.publish('alert:error', err.text());
            });
        } else {
            this.search$.next([]);
        }
    }

    add(friend: User): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Promise((resolve, reject) => {
            this.http.post(`${this.config.get('API')}/mates`,
                JSON.stringify({ mate: friend._id }),
                { headers: headers }
            ).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        if (res.data) {
                            // "populate"
                            res.data.myRequest.friend = friend;
                            res.data.fRequest.friend = this.auth.user;

                            // see if request exists
                            const index = this.auth.user.mates.findIndex(
                                friendship => friendship._id === res.data.myRequest._id
                            );
                            if (index > -1) {
                                // we are accepting pending request -> replace
                                this.auth.user.mates[index] = res.data.myRequest;
                                this.sockets.socket.emit('mate:', 'accepted', res.data);
                            } else {
                                // new request
                                this.auth.user.mates.push(res.data.myRequest);
                                this.sockets.socket.emit('mate:', 'requested', res.data);
                            }
                            this.sortMatesByStatus();
                        }
                        resolve(res);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    remove(friendshipId: string) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/mates/${friendshipId}`, {
                headers: headers
            }).map(res => res.json()).subscribe((res: any) => {
                    if (res.success) {
                        let index = this.auth.user.mates.findIndex((f: Friendship) => {
                            return f._id === friendshipId;
                        });
                        if (index > -1) {
                            this.auth.user.mates.splice(index, 1);
                            this.sockets.socket.emit('mate:', 'remove', res.data);
                            this.sortMatesByStatus();
                        }
                        resolve(res);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                }, (err) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    registerSocketEvents(socket) {
        socket.on('mate:', (action: string, data: {fRequest: Friendship, myRequest: Friendship}) => {
            console.info('mate:', action, data);
            let index = -1;
            switch (action) {
                case 'requested':
                    // someone sent me friend request
                    this.auth.user.mates.push(data.fRequest);
                    // TODO test
                    LocalNotifications.schedule({
                        id: 1,
                        text: `New mate request from ${data.fRequest.friend.name}.`
                    });
                    this.sortMatesByStatus('pending');
                    break;

                case 'accepted':
                    // accepted my request
                    index = this.auth.user.mates.findIndex((f) => {
                        return f._id === data.fRequest._id;
                    });
                    if (index > -1) {
                        this.auth.user.mates[index] = data.fRequest;
                        // TODO test
                        LocalNotifications.schedule({
                            id: 1,
                            text: `${data.fRequest.friend.name} accepted your mate request.`
                        });
                        this.sortMatesByStatus();
                    }
                    break;

                case 'remove':
                    index = this.auth.user.mates.findIndex((f) => {
                        return f._id === data.fRequest._id;
                    });
                    if (index > -1) {
                        this.auth.user.mates.splice(index, 1);
                        this.sortMatesByStatus();
                    }
                    break;
            }
        });
    }

    sortMatesByStatus(sortOnly = 'all') {
        setTimeout(() => {
            if (sortOnly === 'accepted' || sortOnly === 'all') {
                this.mates.accepted = this.auth.user.mates.filter(
                    (f: Friendship) => f.status === STATUS_ACCEPTED
                );
            }
            if (sortOnly === 'requested' || sortOnly === 'all') {
                this.mates.requested = this.auth.user.mates.filter(
                    (f: Friendship) => f.status === STATUS_REQUESTED
                );
            }
            if (sortOnly === 'pending' || sortOnly === 'all') {
                this.mates.pending = this.auth.user.mates.filter(
                    (f: Friendship) => f.status === STATUS_PENDING
                );
                this.pending$.next(this.mates.pending.length);
            }
        }, 0);
    }
}
