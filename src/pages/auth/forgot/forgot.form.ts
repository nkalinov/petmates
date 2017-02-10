import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { AuthActions } from '../auth.actions';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';

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
                private authActions: AuthActions,
                private auth: AuthService,
                private store: Store<AppState>) {
    }

    submitForgotRequest(email: string) {
        this.store.dispatch(this.authActions.forgotRequest(email));
        this.mode = 'verify';
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
}
