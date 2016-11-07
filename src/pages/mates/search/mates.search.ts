import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';
import { MatesService } from '../../../providers/mates.service';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs/Subscription';
import { MateViewPage } from '../view/mate.view';

@Component({
    templateUrl: 'mates.search.html'
})
export class MatesSearchPage {
    searchQuery: string = '';
    searchResults: Array<User> = [];
    private searchResults$: Subscription;

    constructor(public mates: MatesService,
                public viewCtrl: ViewController,
                private nav: NavController) {

        this.searchResults$ = mates.search$.subscribe((res) => {
            this.searchResults = res;
        });
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    addMate(mate) {
        this.mates.add(mate).then(() => this.searchResults.splice(this.searchResults.indexOf(mate), 1));
    }

    ionViewWillLeave() {
        this.searchResults$.unsubscribe();
    }
}
