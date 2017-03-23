import { Injectable } from '@angular/core';
import { User } from '../../models/User';
import { IFriendship, STATUS_REQUESTED, STATUS_ACCEPTED, STATUS_PENDING } from '../../models/interfaces/IFriendship';
import { ApiService } from '../../providers/api.service';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatesActions } from './mates.actions';
import { AuthService } from '../auth/auth.service';
import { AlertController } from 'ionic-angular';

@Injectable()
export class MatesService {
    mates = {
        accepted: [],
        requested: [],
        pending: []
    };

    mates$: Observable<IFriendship[]>;
    accepted$: Observable<IFriendship[]>;
    requested$: Observable<IFriendship[]>;
    pending$: Observable<Array<IFriendship>>;

    constructor(private http: ApiService,
                private authService: AuthService,
                private store: Store<AppState>,
                private alertCtrl: AlertController) {

        this.mates$ = this.authService.user$
            .withLatestFrom(
                this.store.select(state => state.entities.users),
                (user, users) => (user.mates || [])
                    .map(mate => Object.assign({}, mate, {
                        friend: users[<string>mate.friend]
                    }))
            );

        this.accepted$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_ACCEPTED));
        this.requested$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_REQUESTED));
        this.pending$ = this.mates$.map(mates => mates.filter(mate => mate.status === STATUS_PENDING));
    }

    getUserDetails(id: string) {
        return this.http.get(`/user/${id}`);
    }

    search(query: string) {
        return this.http.get(`/mates/search?q=${query}`);
    }

    add(id: string) {
        return this.http.post(`/mates/${id}`, null);
    }

    remove(friendId: string) {
        return this.http.delete(`/mates/${friendId}`);
    }

    alertRemove(friend: User) {
        const alert = this.alertCtrl.create({
            title: 'Remove mate',
            message: `Are you sure you want to remove ${friend.name} from your mates?`,
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
                        this.store.dispatch(MatesActions.remove(this.authService.user._id, friend._id));
                    }
                }
            ]
        });
        alert.present();
    }
}
