import { ViewController } from 'ionic-angular';
import { Component, OnDestroy } from '@angular/core';
import { AuthActions } from '../auth.actions';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'forgot.form.html'
})

export class ForgotForm implements OnDestroy {
    mode: 'request' | 'verify' = 'request';
    email: string = '';
    token: string = '';
    password: string = '';
    password2: string = '';

    tokenValid: boolean;
    private subscription: Subscription;

    constructor(public viewCtrl: ViewController,
                private authActions: AuthActions,
                private store: Store<AppState>) {

        this.subscription = this.store.select(state => state.auth.forgot.tokenValid)
            .subscribe(tokenValid => this.tokenValid = tokenValid);
    }

    requestToken() {
        this.store.dispatch(this.authActions.requestForgotToken(this.email));
        this.mode = 'verify';
    }

    verifyToken() {
        this.store.dispatch(this.authActions.verifyToken(this.token));
    }

    changePassword() {
        this.store.dispatch(this.authActions.changePassword(this.token, this.password));
        this.viewCtrl.dismiss();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
