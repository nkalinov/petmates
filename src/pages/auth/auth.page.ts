import { ModalController, LoadingController, Config, Events } from 'ionic-angular';
import { ImagePicker } from 'ionic-native';
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { ForgotForm } from './forgot/forgot.form';
import { LocationService } from '../../providers/location.service';
import { User } from '../../models/User';
import { makeFileRequest } from '../../utils/common';
import { AuthActions } from './auth.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../app/state';

@Component({
    selector: 'auth-page',
    templateUrl: 'auth.page.html'
})

export class AuthPage {
    mode: string = 'login';
    user: User = new User();

    constructor(public auth: AuthService,
                private modalCtrl: ModalController,
                private locationService: LocationService,
                private loadingCtrl: LoadingController,
                private config: Config,
                private events: Events,
                private store: Store<AppState>,
                private authActions: AuthActions) {
    }

    login() {
        this.store.dispatch(
            this.authActions.login(this.user.email, this.user.password)
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
        ImagePicker.getPictures({
            maximumImagesCount: 1,
            width: 500,
            height: 500
        }).then(images => {
            if (images && images.length > 0) {
                const loader = this.loadingCtrl.create();
                loader.present();

                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = {
                    'Authorization': this.auth.token
                };
                const ft = new FileTransfer();
                ft.upload(
                    images[0],
                    encodeURI(`${this.config.get('API')}/upload`),
                    (res: any) => {
                        res.response = JSON.parse(res.response);

                        if (res.response.success) {
                            this.user.pic = res.response.data.url;
                            this.user.picture = res.response.data.filename;
                        } else {
                            this.events.publish('alert:error', res.response.msg);
                        }

                        loader.dismiss();
                    },
                    err => {
                        this.events.publish('alert:error', err.body);
                        loader.dismiss();
                    },
                    options
                );
            }
        }, err => {
            this.events.publish('alert:error', err);
        });
    }

    // dev
    fileChangeEvent(fileInput: any) {
        makeFileRequest(`${this.config.get('API')}/upload`, fileInput.target.files[0], this.auth.token).then(
            (res: any) => {
                if (res.response.success) {
                    this.user.pic = res.response.data.url;
                    this.user.picture = res.response.data.filename;
                } else {
                    this.events.publish('alert:error', res.response.msg);
                }
            },
            err => console.error(err));
    }
}
