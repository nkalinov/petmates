import { Events, Config } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers } from '@angular/http';
import { Pet } from '../../models/Pet';
import { Observable } from 'rxjs/Observable';
import { User } from '../../models/User';
import { Facebook, FacebookLoginResponse } from 'ionic-native';
import { ApiService } from '../../providers/api.service';

@Injectable()
export class AuthService {
    user: User;
    token: string;
    regionUpdated: EventEmitter<string> = new EventEmitter<string>();

    constructor(private http: ApiService,
                private events: Events,
                private config: Config,
                private storage: Storage) {
    }

    refresh(token) {
        // we need to provide the headers here because the token is not yet in the store
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', token);

        return this.http.post('/user/check', null, false, headers);
    }

    login(email, password) {
        return this.http.post('/auth', { email, password }, false);
    }

    // todo
    loginFacebook(): Promise<FacebookLoginResponse> {
        return Facebook.login([
            'public_profile',
            'email'
        ]).then(res => {
            //         if (res.status === 'connected') {
            //             const accessToken = res.authResponse.accessToken;
            //
            //             // todo
            //             this.http.get(`${this.config.get('API')}/auth/facebook?access_token=${accessToken}`)
            //                 .map(res => res.json())
            //                 .subscribe(
            //                     (res: IResponse) => this.store.dispatch(this.authActions.login(res)),
            //                     (err: Response) => this.store.dispatch(this.appService.error(err.text()))
            //                 );
            //
            //         } else if (res.status === 'not_authorized') {
            //             // the user is logged in to Facebook,
            //             // but has not authenticated your app
            //             throw new Error('You must authorize PetMates app.');
            //         } else {
            //             // the user isn't logged in to Facebook.
            //             throw new Error('Please login to Facebook.');
            //         }
            //     }).catch(err => {
            //         this.events.publish('alert:error', err);
        });
    }

    signup(data) {
        return this.http.post('/auth/signup', data);
        // .map(res => res.json())
        // .subscribe(
        //     (res: any) => {
        //         if (res.success) {
        //             // this.login(data.email, data.password);
        //         } else {
        //             this.events.publish('alert:error', 'Username or email already registered');
        //         }
        //     },
        //     (err) => {
        //         this.events.publish('alert:error', err);
        //     }
        // );
    }

    update(data) {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            // this.http
            //     .put(
            //         `${this.config.get('API')}/user`,
            //         JSON.stringify(data),
            //         { headers: headers }
            //     )
            //     .map(res => res.json())
            //     .subscribe(
            //         res => {
            //             if (res.success) {
            //                 // if (res.data) {
            //                 if (data.region && data.region !== this.user.region) {
            //                     this.regionUpdated.emit(data.region);
            //                 }
            //                 this.parseUser(res.data);
            //                 // }
            //                 resolve(this.user);
            //             } else {
            //                 this.events.publish('alert:error', res.msg);
            //                 reject(res.msg);
            //             }
            //         },
            //         err => {
            //             this.events.publish('alert:error', err.text());
            //             reject(err.text());
            //         }
            //     );
        });
    }

    deleteProfile() {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        // this.http
        //     .delete(`${this.config.get('API')}/user`,
        //         { headers: headers }
        //     )
        //     .map(res => res.json())
        //     .subscribe(
        //         (res: any) => {
        //             if (res.success) {
        //                 this.logout();
        //             } else {
        //                 this.events.publish('alert:error', res.msg);
        //             }
        //         },
        //         (err: Response) => {
        //             this.events.publish('alert:error', err.text());
        //         }
        //     );
    }

    logout() {
        this.cleanUser();
        this.events.publish('user:logout');
    }

    submitForgotRequest(email: string) {
        return new Promise((resolve, reject) => {
            // const headers = new Headers();
            // headers.append('Content-Type', 'application/json');
            // this.http
            //     .post(`${this.config.get('API')}/auth/forgot`, JSON.stringify({ email }), { headers })
            //     .map(res => res.json())
            //     .subscribe(
            //         res => {
            //             if (res.success) {
            //                 this.events.publish('alert:info', res.msg);
            //                 resolve();
            //             } else {
            //                 this.events.publish('alert:error', res.msg);
            //                 reject();
            //             }
            //         },
            //         err => {
            //             this.events.publish('alert:error', err);
            //             reject();
            //         }
            //     );
        });
    }

    checkResetToken(token: string): Observable<any> {
        return new Observable(observer => {
            this.http
                .get(`${this.config.get('API')}/auth/reset/${token}`)
                .map(res => res.json())
                .subscribe(
                    (res: any) => {
                        if (!res.success) {
                            this.events.publish('alert:error', res.msg);
                        }
                        observer.next(res);
                        observer.complete();
                    },
                    (err) => {
                        this.events.publish('alert:error', err);
                        observer.next(err);
                        observer.complete();
                    }
                );
        });
    }

    changePassword(token: string, password: string): Observable<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Observable(observer => {
            // this.http
            //     .post(
            //         `${this.config.get('API')}/auth/reset/${token}`,
            //         JSON.stringify({ password }),
            //         { headers: headers }
            //     )
            //     .map(res => res.json())
            //     .subscribe(
            //         (res: any) => {
            //             if (res.success) {
            //                 this.events.publish('alert:info', 'Your password has been changed.');
            //                 // this.login(res.data.email, password);
            //             } else {
            //                 this.events.publish('alert:error', res.msg);
            //             }
            //             observer.next(res);
            //             observer.complete();
            //         },
            //         (err) => {
            //             this.events.publish('alert:error', err);
            //             observer.next(err);
            //             observer.complete();
            //         }
            //     );
        });
    }

    private cleanUser() {
        this.storage.remove('id_token');
        this.user = new User();
        this.token = null;
    }

    private parseUser(data: any) {
        if (data) {
            const user = new User(data);
            user.password = '';
            user.pets = user.pets.map(pet => new Pet(pet));
            user.mates.forEach(mate => {
                mate.friend = new User(mate.friend);
            });
            this.user = user;
        }
    }
}
