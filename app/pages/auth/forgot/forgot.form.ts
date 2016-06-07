import {Page, ViewController} from 'ionic-angular';
import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth.service';

@Component({
    templateUrl: 'build/pages/auth/forgot/forgot.form.html'
})

export class ForgotForm {
    mode:string = 'request';
    email:string = '';
    token:string = '';
    tokenValid = false;
    password:string = '';
    password2:string = '';

    constructor(public viewCtrl:ViewController,
                public auth:AuthService) {
    }

    checkResetToken() {
        this.auth.checkResetToken(this.token).subscribe((res:any) => {
            this.tokenValid = !!res.success;
            if (!this.tokenValid) {
                this.token = '';
            }
        });
    }

    changePassword() {
        this.auth.changePassword(this.token, this.password).subscribe(
            (res:any) => {
                if(res.success) {
                    this.viewCtrl.dismiss();
                }
            }
        )
    }
}