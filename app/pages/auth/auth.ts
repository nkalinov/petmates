import { ModalController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ForgotForm } from './forgot/forgot.form';
import { Location } from '../../models/location.interface';

@Component({
    templateUrl: 'build/pages/auth/auth.html'
})

export class AuthModal {
    mode: string = 'login';
    name: string;
    email: string;
    location: Location = {
        city: '',
        country: ''
    };
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
            this.auth.getLocation().then(location => this.location = location);
        }
    }

    openForgotForm() {
        this.modalCtrl.create(ForgotForm).present();
    }
}
