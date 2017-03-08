import { LocalNotifications } from 'ionic-native';
import { Events, Config } from 'ionic-angular';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { User } from '../models/User';
import { IFriendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING } from '../models/interfaces/IFriendship';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiService } from './api.service';
import { AppState } from '../app/state';
import { Store } from '@ngrx/store';

@Injectable()
export class MatesService {
    search$: Subject<Array<User>> = new Subject<Array<User>>();
    pending$ = new BehaviorSubject(0);
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };

    private cache = {}; // app lifetime cache
    private user: User;

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events,
                private config: Config,
                private sockets: SocketService,
                private store: Store<AppState>) {

        // this.store.select(state => state.auth).subscribe(auth => {
        //     this.user = auth.user;
        // });
    }

    getById(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            if (this.cache[id]) {
                return resolve(this.cache[id]);
            }

            this.http.get(`/user/${id}`).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        const user = new User(res.data, this.user.location.coordinates);
                        this.cache[id] = user;
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
            // this.http.get(`${this.config.get('API')}/mates/search`, {
            //     search: `q=${value}`,
            //     headers: headers
            // }).map(res => res.json()).subscribe((res: any) => {
            //     this.search$.next(
            //         res.data.map(u => new User(u, this.auth.user.location.coordinates))
            //     );
            // }, (err) => {
            //     this.events.publish('alert:error', err.text());
            // });
        } else {
            this.search$.next([]);
        }
    }

    add(friend: User): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http
                .post(`${this.config.get('API')}/mates`, { mate: friend._id })
                .map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        if (res.data) {
                            // "populate"
                            res.data.myRequest.friend = friend;
                            res.data.fRequest.friend = this.user;

                            // see if request exists
                            const index = this.user.mates.findIndex(
                                friendship => friendship._id === res.data.myRequest._id
                            );
                            // if (index > -1) {
                            //     we are accepting pending request -> replace
                            // this.auth.user.mates[index] = res.data.myRequest;
                            // this.sockets.socket.emit('mate:', 'accepted', res.data);
                            // } else {
                            //     new request
                            // this.auth.user.mates.push(res.data.myRequest);
                            // this.sockets.socket.emit('mate:', 'requested', res.data);
                            // }
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
            this.http
                .delete(`/mates/${friendshipId}`)
                .map(res => res.json()).subscribe((res: any) => {
                    if (res.success) {
                        // let index = this.auth.user.mates.findIndex((f: IFriendship) => {
                        //     return f._id === friendshipId;
                        // });
                        // if (index > -1) {
                        //     this.auth.user.mates.splice(index, 1);
                        //     this.sockets.socket.emit('mate:', 'remove', res.data);
                        //     this.sortMatesByStatus();
                        // }
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
        // socket.on('online', activities => {
        //     console.info('online', activities);
        //
        //     if (activities !== {}) {
        //         this.auth.user.mates.forEach(mate => {
        //             const lastActiveTimestamp = activities[mate.friend._id];
        //
        //             if (lastActiveTimestamp) {
        //                 mate.friend.lastActive = new Date(lastActiveTimestamp);
        //             }
        //         });
        //
        //         // re-filter
        //         this.sortMatesByStatus();
        //     }
        // }).emit('online:get', this.auth.user.mates.map(m => m.friend._id));
        //
        // setInterval(() => {
        //     // get my friends last activity timestamp
        //     socket.emit('online:get', this.auth.user.mates.map(m => m.friend._id));
        // }, 90 * 1000);
        //
        // socket.on('mate:', (action: string, data: { fRequest: IFriendship, myRequest: IFriendship }) => {
        //     console.info('mate:', action, data);
        //     let index = -1;
        //
        //     switch (action) {
        //         case 'requested':
        //             // someone sent me friend request
        //             this.auth.user.mates.push(data.fRequest);
        //             LocalNotifications.schedule({
        //                 id: 1,
        //                 text: `New mate request from ${data.fRequest.friend.name}.`
        //             });
        //             this.sortMatesByStatus('pending');
        //             break;
        //
        //         case 'accepted':
        //             // accepted my request
        //             index = this.auth.user.mates.findIndex((f) => {
        //                 return f._id === data.fRequest._id;
        //             });
        //             if (index > -1) {
        //                 this.auth.user.mates[index] = data.fRequest;
        //                 LocalNotifications.schedule({
        //                     id: 2,
        //                     text: `${data.fRequest.friend.name} accepted your mate request.`
        //                 });
        //                 this.sortMatesByStatus();
        //             }
        //             break;
        //
        //         case 'remove':
        //             index = this.auth.user.mates.findIndex((f) => {
        //                 return f._id === data.fRequest._id;
        //             });
        //             if (index > -1) {
        //                 this.auth.user.mates.splice(index, 1);
        //                 this.sortMatesByStatus();
        //             }
        //             break;
        //     }
        // });
    }

    sortMatesByStatus(sortOnly = 'all') {
        // setTimeout(() => {
        //     if (sortOnly === 'accepted' || sortOnly === 'all') {
        //         this.mates.accepted = this.auth.user.mates.filter(
        //             f => f.status === STATUS_ACCEPTED
        //         );
        //     }
        //     if (sortOnly === 'requested' || sortOnly === 'all') {
        //         this.mates.requested = this.auth.user.mates.filter(
        //             f => f.status === STATUS_REQUESTED
        //         );
        //     }
        //     if (sortOnly === 'pending' || sortOnly === 'all') {
        //         this.mates.pending = this.auth.user.mates.filter(
        //             (f: IFriendship) => f.status === STATUS_PENDING
        //         );
        //         this.pending$.next(this.mates.pending.length);
        //     }
        // }, 0);
    }
}
