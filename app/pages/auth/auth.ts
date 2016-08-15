import { ModalController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ForgotForm } from './forgot/forgot.form';

@Component({
    templateUrl: 'build/pages/auth/auth.html'
})

export class AuthModal {
    mode: string = 'login';
    name: string;
    email: string;
    location: {
        city: string,
        country: string,
        coordinates?: Array<Number>
    } = {
        city: '',
        country: ''
    };
    locationModel: string;
    password: string;

    constructor(public auth: AuthService,
                private modalCtrl: ModalController,
                private loadingCtrl: LoadingController) {
    }

    login() {
        this.auth.login(this.name, this.password);
    }

    loginFacebook() {
        const loading = this.loadingCtrl.create({
            content: 'Logging via Facebook...'
        });
        loading.present().then(() => {
            this.auth
                .loginFacebook()
                .then(
                    () => loading.dismiss(),
                    () => loading.dismiss()
                );
        });
    }

    signup() {
        this.auth.signup({
            name: this.name,
            email: this.email,
            password: this.password,
            location: this.location
        });
    }

    geoLocalizeMe() {
        if (!this.location.coordinates) {
            this.auth.getLocation().then(location => {
                this.location = location;
                this.locationModel = this.location.city + ', ' + this.location.country;
            });
        }
    }

    openForgotForm() {
        this.modalCtrl.create(ForgotForm).present();
    }
}
