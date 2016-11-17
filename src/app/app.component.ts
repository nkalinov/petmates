import { Events, Nav, Platform, AlertController } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { AuthModal } from '../pages/auth/auth';
import { AuthService } from '../providers/auth.service';
import { WalkService } from '../providers/walk.service';
import { getMenu } from '../providers/common.service';
import { SocketService } from '../providers/socket.service';
import { MatesService } from '../providers/mates.service';
import { ChatService } from '../providers/chat.service';
import { User } from '../models/user.model';
import { NearbyPage } from '../pages/nearby/nearby';

@Component({
    templateUrl: 'app.html',
})

export class PetMatesApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    pages: Array<any>;
    newRequests: number;

    private defaultRootPage: any = NearbyPage;

    constructor(public auth: AuthService,
                public walk: WalkService,
                private platform: Platform,
                private events: Events,
                private sockets: SocketService,
                private mates: MatesService,
                private chat: ChatService,
                private alertCtrl: AlertController) {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // StatusBar.styleDefault();
            this.initializeApp();
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

    private initializeApp() {
        this.auth.init().then(user => {
            this.loggedIn(user);
        }, (err) => {
            this.loggedOut(err);
        });

        this.events.subscribe('user:login', data => {
            this.loggedIn(data[0]);
        });
        this.events.subscribe('user:logout', () => {
            this.loggedOut();
        });
        this.events.subscribe('alert:error', data => {
            this.showAlert(data[0]);
        });
        this.events.subscribe('alert:info', data => {
            this.showAlert(data[0], 'Info');
        });
    }

    private loggedIn(user: User) {
        this.mates.pending$.subscribe((count) => {
            this.newRequests = count;
        });
        this.mates.sortMatesByStatus();

        // todo get conversations list and show badge in menu on unread msgs

        this.sockets.init(user.region).then(socket => {
            this.pages = getMenu(true); // set logged in menu

            // open default logged in page
            this.openPage(
                this.pages.find(page => page.component === this.defaultRootPage)
            );

            // register socket events
            this.chat.registerSocketEvents(socket);
            this.mates.registerSocketEvents(socket);
            this.walk.registerSocketEvents(socket);
        });
    }

    private loggedOut(err?) {
        this.pages = [];
        this.sockets.disconnect();
        this.openPage({ component: AuthModal, active: false });
    }

    private showAlert(subTitle, title: string = 'Error') {
        this.alertCtrl.create({
            title,
            subTitle,
            buttons: ['OK']
        }).present();
    }
}
