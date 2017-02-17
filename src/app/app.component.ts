import { Events, Nav, Platform, AlertController } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { AuthPage } from '../pages/auth/auth.page';
import { getMenu } from '../utils/common';
import { SocketService } from '../providers/socket.service';
import { MatesService } from '../providers/mates.service';
import { ProfilePage } from '../pages/profile/profile';
import { Store } from '@ngrx/store';
import { AppState } from './state';
import { AuthActions } from '../pages/auth/auth.actions';

@Component({
    templateUrl: 'app.html',
})

export class PetMatesApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    pages: any[];
    newRequests: number; // todo from store

    private defaultRootPage: any = ProfilePage;

    constructor(private platform: Platform,
                private events: Events,
                private sockets: SocketService,
                private mates: MatesService,
                private alertCtrl: AlertController,
                private store: Store<AppState>,
                private authActions: AuthActions) {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // StatusBar.styleDefault();

            this.store.select(state => state.auth.connected).subscribe(connected => {
                if (connected) {
                    this.loggedIn();
                } else {
                    this.loggedOut();
                }
            });

            // try to restore session from persisted token
            this.store.dispatch(
                this.authActions.refresh()
            );

            this.events.subscribe('alert:error', err => {
                this.showAlert(err);
            });
            this.events.subscribe('alert:info', data => {
                this.showAlert(data, 'Info');
            });
        });
    }

    openPage(page) {
        if (!page.active) {
            if (this.pages) {
                this.pages.forEach(page => page.active = false);
            }
            // Reset the content nav to have just this page
            // we wouldn't want the back button to show in this scenario
            this.nav.setRoot(page.component);
            page.active = true;
        }
    }

    private loggedIn() {
        // this.mates.pending$.subscribe((count) => {
        //     this.newRequests = count;
        // });
        // this.mates.sortMatesByStatus();

        // todo get conversations list and show badge in menu on unread msgs

        // set logged in menu
        this.pages = getMenu(true);

        // open default logged in page
        this.openPage(
            this.pages.find(page => page.component === this.defaultRootPage)
        );
    }

    private loggedOut(err?) {
        this.pages = [];
        this.sockets.disconnect();
        this.openPage({ component: AuthPage, active: false });
    }

    private showAlert(subTitle, title: string = 'Error') {
        this.alertCtrl.create({
            title,
            subTitle,
            buttons: ['OK']
        }).present();
    }
}
