import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { AuthActions } from './auth.actions';
import { AppActions } from '../../app/app.actions';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth.service';
import { IResponse } from '../../models/interfaces/IResponse';
import { User } from '../../models/User';

@Injectable()
export class AuthEffects {
    constructor(private storage: Storage,
                private actions$: Actions,
                private authService: AuthService,
                private appActions: AppActions,
                private authActions: AuthActions) {
    }

    @Effect()
    login$ = this.actions$
        .ofType(AuthActions.LOGIN)
        .map(toPayload)
        .switchMap(({ email, password }) =>
            this.authService.login(email, password)
                .map(res => {
                    if (res.success) {
                        const token = res.data.token,
                            user = res.data.profile;

                        this.storage.set('id_token', token);

                        return this.authActions.loginSuccess(token, user);
                    }
                    return this.appActions.error(res.msg);
                })
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

    @Effect()
    refresh$ = this.actions$
        .ofType(AuthActions.REFRESH)
        .switchMap(() =>
            Observable
                .fromPromise(this.storage.get('id_token'))
                .switchMap(token =>
                    token
                        ? this.authService.refresh(token)
                        .map((res: IResponse) =>
                            res.success
                                ? this.authActions.loginSuccess(token, res.data)
                                : Observable.throw('Username does not exist or the token is invalid')
                        )
                        : Observable.throw('No token in storage')
                )
                .catch(() => Observable.of(this.authActions.logout()))
        );

    @Effect()
    signup$ = this.actions$
        .ofType(AuthActions.SIGNUP)
        .map(toPayload)
        .switchMap(data =>
            this.authService.signup(data)
                .map(res =>
                    res.success
                        ? this.authActions.login(data.email, data.password)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

    @Effect({ dispatch: false })
    logout$ = this.actions$
        .ofType(AuthActions.LOGOUT)
        .do(() => {
            this.storage.remove('id_token');
        });

    @Effect()
    delete$ = this.actions$
        .ofType(AuthActions.REMOVE)
        .switchMap(() =>
            this.authService.deleteProfile()
                .map((res: IResponse) =>
                    res.success
                        ? this.authActions.logout()
                        : this.appActions.error(res.msg))
        )
        .catch(e => Observable.of(e.toString()));

    @Effect()
    update$ = this.actions$
        .ofType(AuthActions.UPDATE)
        .map(toPayload)
        .switchMap((data: User) =>
            this.authService.update(data)
                .map(res =>
                    res.success
                        ? this.authActions.updateSuccess(data)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

    @Effect()
    requestToken$ = this.actions$
        .ofType(AuthActions.FORGOT_REQ)
        .map(toPayload)
        .switchMap((email: string) =>
            this.authService.requestToken(email)
                .map(res =>
                    res.success
                        ? this.authActions.requestForgotTokenSuccess(res.msg)
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

    @Effect()
    verifyToken$ = this.actions$
        .ofType(AuthActions.FORGOT_VERIFY_TOKEN)
        .map(toPayload)
        .switchMap((token: string) =>
            this.authService.verifyToken(token)
                .map(res =>
                    res.success
                        ? this.authActions.verifyTokenSuccess()
                        : this.appActions.error(res.msg)
                )
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        );

    @Effect()
    changePassword = this.actions$
        .ofType(AuthActions.FORGOT_CHANGE_PASSWORD)
        .map(toPayload)
        .switchMap(({ token, password }) =>
            this.authService.changePassword(token, password)
                .map(res => ({ password, res }))
                .catch(e => Observable.of(this.appActions.error(e.toString())))
        )
        .mergeMap(({ password, res }) => res.success
            ? Observable.of(
                this.authActions.changePasswordSuccess(),
                this.authActions.login(res.data.email, password)
            )
            : Observable.of(this.appActions.error(res.msg))
        );
}
