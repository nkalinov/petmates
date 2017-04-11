import { Events, Nav, Platform, AlertController } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { AuthPage } from '../pages/auth/auth.page';
import { SocketService } from '../providers/socket.service';
import { MatesService } from '../pages/mates/mates.service';
import { Store } from '@ngrx/store';
import { AppState } from './state';
import { AuthActions } from '../pages/auth/auth.actions';
import { ChatsListPage } from '../pages/chat/chats-list.page';
import { ChatService } from '../providers/chat.service';
import { MapPage } from '../pages/map/MapPage';
import { NearbyPage } from '../pages/nearby/nearby';
import { MatesPage } from '../pages/mates/mates.page';
import { ProfilePage } from '../pages/profile/profile.page';
import { HelpPage } from '../pages/help/help';

@Component({
    templateUrl: 'app.html',
})

export class PetMatesApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    pages: any[] = [];
    newMateRequests: number;
    unreadMessages: number;

    private defaultRootPage: any = ChatsListPage;

    constructor(private platform: Platform,
                private events: Events,
                private sockets: SocketService,
                private matesService: MatesService,
                private chatService: ChatService,
                private alertCtrl: AlertController,
                private store: Store<AppState>) {
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
            this.store.dispatch(AuthActions.refresh());

            this.events.subscribe('alert:error', err => {
                this.showAlert(err);
            });

            this.events.subscribe('alert:info', data => {
                this.showAlert(data, 'Info');
            });

            // Badges
            this.matesService.pending$.subscribe(mates => {
                this.newMateRequests = mates.length;
            });

            this.chatService.chats$.subscribe(chats => {
                this.unreadMessages = chats.reduce((acc, curr) => acc + curr.newMessages || acc, 0);
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
        this.pages = [
            { title: 'Map', component: MapPage },
            { title: 'Explore', component: NearbyPage },
            { title: 'Chat', component: ChatsListPage },
            { title: 'Mates', component: MatesPage },
            { title: 'My profile', component: ProfilePage },
            { title: 'Help', component: HelpPage }
            // {title: 'Donate', component: DonatePage} // todo
        ];

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
