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
import {MatesPage} from "./pages/mates/mates";
import {SocketService} from "./services/socket.service";
import {MatesService} from "./services/mates.service";
import {ChatService} from "./services/chat.service";
import {Subscription} from "rxjs/Subscription";

enableProdMode();

@App({
    templateUrl: 'build/app.html',
    config: {
        API: 'http://192.168.0.104:3001',
        emitCoordsIntervalMs: 10000,
        deleteInactiveIntervalMs: 20000,
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
class MyApp {
    pages:Array<any> = [];
    rootPage:any;
    pages:Array<{title:string, component:any}>;
    local:Storage = new Storage(LocalStorage);

    private defaultRootPage:MatesPage = MatesPage;
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
        if (page.component === AuthModal) {
            this.showAuthModal();
        } else {
            // Reset the content nav to have just this page
            // we wouldn't want the back button to show in this scenario
            let nav = this.app.getRootNav();
            nav.setRoot(page.component);
        }
    }

    private initializeApp() {
        this.subscribeToEvents();

        this.auth.init().then(() => {
            this.rootPage = this.defaultRootPage;
            this.pages = CommonService.getMenu(true);
            this.loggedIn();
        }, () => {
            this.pages = CommonService.getMenu();
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
        this.pages = CommonService.getMenu(true);
        this.rootPage = this.defaultRootPage;
        this.mates.sortMatesByStatus();
        
        // register socket events handlers
        this.sockets.init().then((socket) => {
            this.mates.registerSocketEvents(socket);
            this.chat.registerChatEvents(socket);
            // socket.on('users', (data) => {
            // });
            if (this.authModal) {
                this.authModal.dismiss();
            }
        });
    }

    private loggedOut() {
        this.sockets.disconnect();
        // todo unsubscribe
        this.showAuthModal();
    }
}
