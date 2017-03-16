import { LocalNotifications } from 'ionic-native';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { User } from '../../models/User';
import { IFriendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING } from '../../models/interfaces/IFriendship';
import { ApiService } from '../../providers/api.service';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatesActions } from './mates.actions';
import { AuthService } from '../auth/auth.service';
import { AlertController } from 'ionic-angular';

@Injectable()
export class MatesService {
    search$: Subject<Array<User>> = new Subject<Array<User>>();
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };

    mates$: BehaviorSubject<IFriendship[]> = new BehaviorSubject([]);
    accepted$: Observable<IFriendship[]>;
    requested$: Observable<IFriendship[]>;
    pending$: Observable<Array<IFriendship>>;

    private cache = {}; // app lifetime cache
    private user: User;

    constructor(private http: ApiService,
                private authService: AuthService,
                private store: Store<AppState>,
                private alertCtrl: AlertController) {

        // this.store.select(state => state.auth).subscribe(auth => {
        //     this.user = auth.user;
        // });
        this.store.select(state => state.entities.users)
            .withLatestFrom(this.store.select(state => state.auth.user))
            .map(([users, uid]) =>
                (uid && users[uid].mates || []).map(mate => {
                    mate.friend = typeof mate.friend === 'string'
                        ? users[<string>mate.friend]
                        : mate.friend;
                    return mate;
                })
            )
            .subscribe(this.mates$);

        this.accepted$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_ACCEPTED));
        this.requested$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_REQUESTED));
        this.pending$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_PENDING));
    }

    getUserDetails(id: string) {
        return this.http.get(`/user/${id}`);
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

    add(friend: User) {
        return this.http.post(`/mates/${friend._id}`, null);
        // this.http
        //     .post(`${this.config.get('API')}/mates`, { mate: friend._id })
        //     .map(res => res.json()).subscribe(
        //     (res: any) => {
        //         if (res.success) {
        //             if (res.data) {
        //                 // "populate"
        //                 res.data.myRequest.friend = friend;
        //                 res.data.fRequest.friend = this.user;
        //
        //                 // see if request exists
        //                 const index = this.user.mates.findIndex(
        //                     friendship => friendship._id === res.data.myRequest._id
        //                 );
        //                 // if (index > -1) {
        //                 //     we are accepting pending request -> replace
        //                 // this.auth.user.mates[index] = res.data.myRequest;
        //                 // this.sockets.socket.emit('mate:', 'accepted', res.data);
        //                 // } else {
        //                 //     new request
        //                 // this.auth.user.mates.push(res.data.myRequest);
        //                 // this.sockets.socket.emit('mate:', 'requested', res.data);
        //                 // }
        //                 this.sortMatesByStatus();
        //             }
        //             resolve(res);
        //         } else {
        //             this.events.publish('alert:error', res.msg);
        //             reject(res.msg);
        //         }
        //     },
        //     (err) => {
        //         this.events.publish('alert:error', err.text());
        //         reject(err.text());
        //     }
        // );
    }

    alertRemove(friend: User) {
        const alert = this.alertCtrl.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${friend.name} from you mates?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Remove',
                    role: 'destructive',
                    handler: () => {
                        alert.dismiss();
                        this.store.dispatch(MatesActions.remove(this.authService.userId, friend._id));
                    }
                }
            ]
        });
        alert.present();
    }

    remove(friendId: string) {
        return this.http.delete(`/mates/${friendId}`);
    }

    // registerSocketEvents(socket) {
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
    //     console.info('< mate:', action, data);

    // switch (action) {
    // case 'requested':
    //     // someone sent me friend request
    //     this.auth.user.mates.push(data.fRequest);
    //     LocalNotifications.schedule({
    //         id: 1,
    //         text: `New mate request from ${data.fRequest.friend.name}.`
    //     });
    //     this.sortMatesByStatus('pending');
    //     break;
    //
    // case 'accepted':
    //     // accepted my request
    //     index = this.auth.user.mates.findIndex((f) => {
    //         return f._id === data.fRequest._id;
    //     });
    //     if (index > -1) {
    //         this.auth.user.mates[index] = data.fRequest;
    //         LocalNotifications.schedule({
    //             id: 2,
    //             text: `${data.fRequest.friend.name} accepted your mate request.`
    //         });
    //         this.sortMatesByStatus();
    //     }
    //     break;

    // case 'remove':
    //     this.store.dispatch(MatesActions.removeSuccess(this.authService.userId, data.fRequest.friend._id));
    //     break;
    // }
    // });
    // }
}
