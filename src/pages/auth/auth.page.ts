import { ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ForgotForm } from './forgot/forgot.form';
import { LocationService } from '../../providers/location.service';
import { User } from '../../models/User';
import { AuthActions } from './auth.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../app/state';
import { IResponseUpload } from '../../models/interfaces/IResponseUpload';

@Component({
    selector: 'auth-page',
    templateUrl: 'auth.page.html'
})

export class AuthPage {
    mode: string = 'login';
    user: User = new User();

    constructor(private modalCtrl: ModalController,
                private locationService: LocationService,
                private store: Store<AppState>) {
    }

    login() {
        this.store.dispatch(AuthActions.login(this.user.email, this.user.password));
    }

    signup() {
        this.store.dispatch(AuthActions.signup(this.user));
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

    onUploadSuccess(res: IResponseUpload) {
        this.user.pic = res.data.url;
        this.user.picture = res.data.filename;
    }
}
