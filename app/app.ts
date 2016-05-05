import {
    App,
    IonicApp,
    Platform,
    NavController,
    Modal,
    Storage,
    LocalStorage,
    Events,
    Alert,
    ViewController
} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {enableProdMode} from 'angular2/core';

import {MapPage} from './pages/map/map';
import {AuthModal} from './pages/auth/auth';
import {AuthService} from './services/auth.service';
import {BreedService} from './services/breed.service';
import {WalkService} from './services/walk.service.ts';
import {CommonService} from './services/common.service';
import {MatesPage} from "./pages/mates/mates";
import {SocketService} from "./services/socket.service";
import {MatesService} from "./services/mates.service";

enableProdMode();

@App({
    templateUrl: 'build/app.html',
    config: {
        API: 'http://localhost:3001',
        emitCoordsIntervalMs: 10000,
        deleteInactiveIntervalMs: 20000,
        defaultPetImage: 'build/img/default_pet.jpg',
        defaultMateImage: 'build/img/default_user.gif',
    },
    providers: [AuthService, BreedService, WalkService, SocketService, MatesService]
})
class MyApp {
    pages:Array<any> = [];
    rootPage:any;
    pages:Array<{title:string, component:any}>;
    local:Storage = new Storage(LocalStorage);

    private authModal:ViewController;

    constructor(private app:IonicApp,
                private platform:Platform,
                public auth:AuthService,
                private events:Events,
                public walk:WalkService,
                private sockets:SocketService) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            this.checkFeatures();
            this.subscribeToEvents();

            this.auth.init().then(() => {
                this.rootPage = MatesPage;
                this.pages = CommonService.getMenu(true);
                this.sockets.socketAuth();
            }, () => {
                this.pages = CommonService.getMenu();
            });
        });
    }

    openPage(page) {
        if (page.component === AuthModal) {
            this.showAuthModal();
        } else {
            // Reset the content nav to have just this page
            // we wouldn't want the back button to show in this scenario
            let nav = this.app.getRootNav();
            nav.setRoot(page.component);
        }
    }

    ///////////////////

    private subscribeToEvents() {
        this.events.subscribe('user:login', () => {
            this.rootPage = MapPage;
            this.pages = CommonService.getMenu(true);
            this.openPage(this.rootPage);
            this.sockets.socketAuth();
            this.authModal.dismiss();
        });
        this.events.subscribe('user:logout', () => {
            this.showAuthModal();
        });
        this.events.subscribe('alert:error', (msg) => {
            this.showAlert(msg);
        });
        this.events.subscribe('alert:info', (msg) => {
            this.showAlert(msg, 'Info');
        });
    }

    /**
     * Show auth modal (login, sign-up)
     */
    private showAuthModal() {
        this.authModal = Modal.create(AuthModal);
        let nav:NavController = this.app.getComponent('nav');
        nav.present(this.authModal);
    }

    /**
     * Show alert
     * @param msg
     * @param title
     */
    private showAlert(msg, title?:string = 'Error!') {
        let alert = Alert.create({
            title: title,
            subTitle: msg,
            buttons: ['OK']
        });
        let nav:NavController = this.app.getComponent('nav');
        nav.present(alert);
    }

    private checkFeatures() {
        if ((<any>navigator).camera) {
            this.showAlert('Camera OK', 'Feature');
        }
        if (typeof FileTransfer !== 'undefined') {
            this.showAlert('FileTransfer OK', 'Feature');
        }
    }
}
