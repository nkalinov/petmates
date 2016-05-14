import {Page, NavController, Modal} from 'ionic-angular';
import {AuthService} from '../../services/auth.service';
import {ForgotForm} from './forgot/forgot.form';

@Page({
    templateUrl: 'build/pages/auth/auth.html'
})

export class AuthModal {
    mode:string = 'login';
    name:string;
    email:string;
    password:string;

    constructor(private auth:AuthService,
                private nav:NavController) {
    }

    login() {
        this.auth.login(this.name, this.password);
    }

    signup() {
        this.auth.signup({
            name: this.name,
            email: this.email,
            password: this.password
        });
    }

    openForgotForm() {
        this.nav.present(Modal.create(ForgotForm));
    }
}
