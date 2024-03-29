import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../../providers/auth.service';

@Component({
    templateUrl: 'forgot.form.html'
})

export class ForgotForm {
    mode: 'request' | 'verify' = 'request';
    email: string = '';
    token: string = '';
    tokenValid = false;
    password: string = '';
    password2: string = '';

    constructor(public viewCtrl: ViewController,
                private auth: AuthService) {
    }

    checkResetToken() {
        this.auth.checkResetToken(this.token).subscribe((res: any) => {
            this.tokenValid = !!res.success;
            if (!this.tokenValid) {
                this.token = '';
            }
        });
    }

    changePassword() {
        this.auth.changePassword(this.token, this.password).subscribe(
            (res: any) => {
                if (res.success) {
                    this.viewCtrl.dismiss();
                }
            }
        );
    }

    submitForgotRequest(email: string) {
        this.auth.submitForgotRequest(email)
            .then(() => this.mode = 'verify');
    }
}
