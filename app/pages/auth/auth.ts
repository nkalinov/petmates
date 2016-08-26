import { ModalController, LoadingController, Config, Events } from 'ionic-angular';
import { ImagePicker } from 'ionic-native';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ForgotForm } from './forgot/forgot.form';
import { LocationService } from '../../services/location.service';
import { User } from '../../models/user.model';
import { MateImage } from '../../common/mate-image';
import { makeFileRequest } from "../../services/common.service";

@Component({
    templateUrl: 'build/pages/auth/auth.html',
    directives: [MateImage]
})

export class AuthModal {
    mode: string = 'login';
    user: User = new User();

    constructor(public auth: AuthService,
                private modalCtrl: ModalController,
                private locationService: LocationService,
                private loadingCtrl: LoadingController,
                private config: Config,
                private events: Events) {
        // this.locationService.getLocation().then(location => this.location = location);
    }

    login() {
        this.auth.login(this.user.email, this.user.password);
    }

    loginFacebook() {
        const loading = this.loadingCtrl.create({
            content: 'Logging via Facebook...'
        });
        loading.present();
        this.auth.loginFacebook().then(
            () => loading.dismiss(),
            () => loading.dismiss()
        );
    }

    signup() {
        this.auth.signup({
            name: this.user.name,
            email: this.user.email,
            password: this.user.password,
            picture: this.user.picture,
            city: this.user.city,
            country: this.user.country,
            location: this.user.location
        });
    }

    geoLocalizeMe() {
        if (!this.user.location.coordinates) {
            this.locationService.getLocation().then(
                location => {
                    this.user.city = location.city;
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
                        this.events.publish('alert:error', err.text());
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
