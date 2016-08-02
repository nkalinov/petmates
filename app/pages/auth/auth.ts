import { NavController, Modal, Loading } from 'ionic-angular';
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
                private nav: NavController) {
    }

    login() {
        this.auth.login(this.name, this.password);
    }

    loginFacebook() {
        let loading = Loading.create({
            content: 'Logging via Facebook...'
        });

        this.nav.present(loading);
        this.auth
            .loginFacebook()
            .then(() => loading.dismiss(), () => loading.dismiss());
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
        this.nav.present(Modal.create(ForgotForm));
    }
}
