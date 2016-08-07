import 'leaflet';
import 'leaflet.markercluster';
import './leaflet.markercluster.layersupport-src';

import { Events, Nav, ionicBootstrap, Platform, AlertController } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { AuthModal } from './pages/auth/auth';
import { AuthService } from './services/auth.service';
import { BreedService } from './services/breed.service';
import { WalkService } from './services/walk.service.ts';
import { CommonService } from './services/common.service';
import { SocketService } from './services/socket.service';
import { MatesService } from './services/mates.service';
import { ChatService } from './services/chat.service';
import { MapPage } from './pages/map/map';
import { Page } from './models/page.interface';
import { PlacesService } from './services/places.service';

@Component({
    templateUrl: 'build/app.html',
})

class PetMatesApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    pages: Array<Page>;
    newRequests: number;
    private defaultRootPage: any = MapPage;

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
                this.pages.forEach((page: Page) => page.active = false);
            }
            // Reset the content nav to have just this page
            // we wouldn't want the back button to show in this scenario
            this.nav.setRoot(page.component);
            page.active = true;
        }
    }

    private initializeApp() {
        this.events.subscribe('user:login', () => {
            this.loggedIn();
        });
        this.events.subscribe('user:logout', () => {
            this.loggedOut();
        });
        this.events.subscribe('alert:error', (msg) => {
            this.showAlert(msg);
        });
        this.events.subscribe('alert:info', (msg) => {
            this.showAlert(msg, 'Info');
        });

        this.auth.init().then((user) => {
            this.loggedIn();
        }, (err) => {
            this.loggedOut(err);
        });
    }

    private loggedIn() {
        this.pages = CommonService.getMenu(true); // set logged in menu

        // open default logged in page
        let page = this.pages.find((page: Page) => page.component === this.defaultRootPage);
        this.openPage(page);

        this.mates.sortMatesByStatus();
        this.mates.pending$.subscribe((count) => {
            this.newRequests = count;
        });

        // todo get conversations list and show badge in menu on unread msgs

        // register socket events handlers
        this.sockets.init().then((socket) => {
            this.mates.registerSocketEvents(socket);
            this.chat.registerChatEvents(socket);
            this.walk.registerSocketEvents(socket);
        });
    }

    private loggedOut(err?) {
        this.pages = null;
        this.sockets.disconnect();
        this.openPage({ component: AuthModal, active: false });
    }

    private showAlert(msg, title: string = 'Error!') {
        this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: ['OK']
        }).present();
    }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/
ionicBootstrap(PetMatesApp, [
    AuthService,
    BreedService,
    WalkService,
    SocketService,
    MatesService,
    ChatService,
    PlacesService
], {
    tabbarPlacement: 'bottom',
    // prodMode: true,
    // API: 'http://79.124.64.127:3001',
    // API: 'http://192.168.0.104:3001',
    API: 'http://127.0.0.1:3001',
    emitCoordsIntervalMs: 15 * 1000,
    deleteInactiveIntervalMs: 30 * 1000,
    defaultPetImage: 'build/img/default_pet.jpg',
    defaultMateImage: 'build/img/default_user.gif'
});
