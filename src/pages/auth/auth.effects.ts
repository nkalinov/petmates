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
                private authService: AuthService) {
    }

    @Effect()
    login$ = this.actions$
        .ofType(AuthActions.LOGIN)
        .map(toPayload)
        .switchMap(({ email, password }) =>
            this.authService.login(email, password)
                .map(res => {
                    if (res.success) {
                        const token = res.data.token;
                        this.storage.set('id_token', token);
                        return AuthActions.loginSuccess(token, res.data.user);
                    }
                    return AppActions.error(res.msg);
                })
                .catch(e => Observable.of(AppActions.error(e.toString())))
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
                                ? AuthActions.loginSuccess(token, res.data)
                                : Observable.throw('Username does not exist or the token is invalid')
                        )
                        : Observable.throw('No token in storage')
                )
                .catch(() => Observable.of(AuthActions.logout()))
        );

    @Effect()
    signup$ = this.actions$
        .ofType(AuthActions.SIGNUP)
        .map(toPayload)
        .switchMap(data =>
            this.authService.signup(data)
                .map(res =>
                    res.success
                        ? AuthActions.login(data.email, data.password)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect({ dispatch: false })
    logout$ = this.actions$
        .ofType(AuthActions.LOGOUT)
        .do(() => {
            this.storage.remove('id_token');
        });

    @Effect()
    remove$ = this.actions$
        .ofType(AuthActions.REMOVE)
        .switchMap(() =>
            this.authService.deleteProfile()
                .map((res: IResponse) =>
                    res.success
                        ? AuthActions.logout()
                        : AppActions.error(res.msg))
        )
        .catch(e => Observable.of(e.toString()));

    @Effect()
    update$ = this.actions$
        .ofType(AuthActions.UPDATE)
        .map(toPayload)
        .switchMap((user: User) =>
            this.authService.update(user)
                .map(res =>
                    res.success
                        ? AuthActions.updateSuccess(user)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    requestToken$ = this.actions$
        .ofType(AuthActions.FORGOT_REQ)
        .map(toPayload)
        .switchMap((email: string) =>
            this.authService.requestToken(email)
                .map(res =>
                    res.success
                        ? AuthActions.requestForgotTokenSuccess(res.msg)
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    verifyToken$ = this.actions$
        .ofType(AuthActions.FORGOT_VERIFY_TOKEN)
        .map(toPayload)
        .switchMap((token: string) =>
            this.authService.verifyToken(token)
                .map(res =>
                    res.success
                        ? AuthActions.verifyTokenSuccess()
                        : AppActions.error(res.msg)
                )
                .catch(e => Observable.of(AppActions.error(e.toString())))
        );

    @Effect()
    changePassword = this.actions$
        .ofType(AuthActions.FORGOT_CHANGE_PASSWORD)
        .map(toPayload)
        .switchMap(({ token, password }) =>
            this.authService.changePassword(token, password)
                .map(res => ({ password, res }))
                .catch(e => Observable.of(AppActions.error(e.toString())))
        )
        .mergeMap(({ password, res }) => res.success
            ? Observable.of(
                AuthActions.changePasswordSuccess(),
                AuthActions.login(res.data.email, password)
            )
            : Observable.of(AppActions.error(res.msg))
        );
}
