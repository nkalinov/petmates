import { ModalController, Platform } from 'ionic-angular';
import { ImagePicker } from 'ionic-native';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from './auth.service';
import { ForgotForm } from './forgot/forgot.form';
import { LocationService } from '../../providers/location.service';
import { User } from '../../models/User';
import { AuthActions } from './auth.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../app/state';
import { ApiService } from '../../providers/api.service';
import { IResponseUpload } from '../../models/interfaces/IResponseUpload';

@Component({
    selector: 'auth-page',
    templateUrl: 'auth.page.html'
})

export class AuthPage {
    mode: string = 'login';
    user: User = new User();
    @ViewChild('fileInput') fileInput: ElementRef;

    constructor(private auth: AuthService,
                private apiService: ApiService,
                private modalCtrl: ModalController,
                private locationService: LocationService,
                private store: Store<AppState>,
                private authActions: AuthActions,
                private platform: Platform) {
    }

    login() {
        this.store.dispatch(
            this.authActions.login(this.user.email, this.user.password)
        );
    }

    signup() {
        this.store.dispatch(
            this.authActions.signup(this.user)
        );
    }

    loginFacebook() {
        // const loading = this.loadingCtrl.create({
        //     content: 'Logging via Facebook...'
        // });
        // loading.present();
        // this.auth.loginFacebook().then(
        //     () => loading.dismiss(),
        //     () => loading.dismiss()
        // );
    }

    geoLocalizeMe() {
        if (!this.user.location.coordinates) {
            this.locationService.getLocation().then(
                location => {
                    this.user.city = location.city;
                    this.user.region = location.region;
                    this.user.country = location.country;
                    this.user.location.coordinates = location.coordinates;
                }
            );
        }
    }

    openForgotForm() {
        this.modalCtrl.create(ForgotForm).present();
    }

    changePicture() {
        if (this.platform.is('cordova')) {
            ImagePicker.getPictures({
                maximumImagesCount: 1,
                width: 500,
                height: 500
            }).then(images => {
                if (images && images.length > 0) {
                    this.apiService.upload(images[0])
                        .subscribe(this.uploadSuccessCallback.bind(this));
                }
            });
        } else {
            // web
            this.fileInput.nativeElement.click();
        }
    }

    fileChangeEvent(fileInput: any) {
        this.apiService.upload(fileInput.target.files[0])
            .subscribe(this.uploadSuccessCallback.bind(this));
    }

    private uploadSuccessCallback(res: IResponseUpload) {
        this.user.pic = res.data.url;
        this.user.picture = res.data.filename;
    }
}
