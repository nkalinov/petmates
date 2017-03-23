import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';
import { User } from '../../../models/User';
import { MateViewPage } from '../view/mate-view.page';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app/state';
import { MatesActions } from '../mates.actions';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    templateUrl: 'mates-search.page.html'
})
export class MatesSearchPage {
    query: string = '';
    results$: BehaviorSubject<User[]> = new BehaviorSubject([]);
    private lastQuery: string;

    constructor(public viewCtrl: ViewController,
                private nav: NavController,
                private authService: AuthService,
                private store: Store<AppState>) {

        this.store.select(state => state.matesSearchResults)
            .withLatestFrom(this.store.select(state => state.entities.users))
            .map(([results, users]) => results.map(uid => users[uid]))
            .subscribe(this.results$);
    }

    onSearchInput(ev: any) {
        let query = ev.target.value;

        if (query && query.trim() !== '' && query !== this.lastQuery) {
            this.store.dispatch(MatesActions.search(query.trim()));
            this.lastQuery = query;
        }
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    addMate(id: string) {
        this.store.dispatch(MatesActions.add(this.authService.user._id, id));
        this.results$.getValue().splice(this.results$.getValue().findIndex(u => u._id === id), 1);
    }
}
