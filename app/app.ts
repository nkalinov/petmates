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
import {AuthModal} from './pages/auth/auth';
import {AuthService} from './services/auth.service';
import {BreedService} from './services/breed.service';
import {WalkService} from './services/walk.service.ts';
import {CommonService} from './services/common.service';
import {SocketService} from './services/socket.service';
import {MatesService} from './services/mates.service';
import {ChatService} from './services/chat.service';
import {MapPage} from './pages/map/map';

enableProdMode();

@App({
    templateUrl: 'build/app.html',
    config: {
        API: 'http://127.0.0.1:3001',
        // API: 'http://192.168.0.104:3001',
        emitCoordsIntervalMs: 15 * 1000,
        deleteInactiveIntervalMs: 30 * 1000,
        defaultPetImage: '/build/img/default_pet.jpg',
        defaultMateImage: '/build/img/default_user.gif',
    },
    providers: [
        AuthService,
        BreedService,
        WalkService,
        SocketService,
        MatesService,
        ChatService
    ]
})
class PetMatesApp {
    pages:Array<any> = [];
    rootPage:any;
    pages:Array<{title:string, component:any, active:boolean}>;
    local:Storage = new Storage(LocalStorage);

    private defaultRootPage:any = MapPage;
    private authModal:ViewController;

    constructor(public auth:AuthService,
                public walk:WalkService,
                private app:IonicApp,
                private platform:Platform,
                private events:Events,
                private sockets:SocketService,
                private mates:MatesService,
                private chat:ChatService) {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            this.initializeApp();
        });
    }

    openPage(page) {
        if (!page.active) {
            if (page.component === AuthModal) {
                this.showAuthModal();
            } else {
                // reset active state
                this.pages.forEach((page) => page.active = false);

                // Reset the content nav to have just this page
                // we wouldn't want the back button to show in this scenario
                let nav = this.app.getRootNav();
                nav.setRoot(page.component);
                page.active = true;
            }
        }
    }

    private initializeApp() {
        this.subscribeToEvents();

        this.auth.init().then((user) => {
            this.loggedIn();
        }, (err) => {
            this.loggedOut();
        });
    }

    private subscribeToEvents() {
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
    }

    private showAuthModal() {
        this.authModal = Modal.create(AuthModal);
        let nav:NavController = this.app.getComponent('nav');
        nav.present(this.authModal);
        // set as active
        let find = this.pages.find((page) => page.component === AuthModal);
        if (find) {
            find.active = true;
        }
    }

    private showAlert(msg, title:string = 'Error!') {
        let alert = Alert.create({
            title: title,
            subTitle: msg,
            buttons: ['OK']
        });
        let nav:NavController = this.app.getComponent('nav');
        nav.present(alert);
    }

    private loggedIn() {
        this.rootPage = this.defaultRootPage;
        this.pages = CommonService.getMenu(true);

        // set as active
        let find = this.pages.find((page) => page.component === this.rootPage);
        if (find) {
            find.active = true;
        }

        this.mates.sortMatesByStatus();

        // register socket events handlers
        this.sockets.init().then((socket) => {
            this.mates.registerSocketEvents(socket);
            this.chat.registerChatEvents(socket);
            this.walk.registerSocketEvents(socket);

            if (this.authModal) {
                setTimeout(() => {
                    this.authModal.dismiss();
                }, 500);
            }
        });
    }

    private loggedOut() {
        this.pages = CommonService.getMenu();
        this.sockets.disconnect();
        this.showAuthModal();
    }
}
