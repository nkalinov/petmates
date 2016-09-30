import { Events, Config } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user.model';
import { Facebook, FacebookLoginResponse } from 'ionic-native';

@Injectable()
export class AuthService {
    user: User;
    token: string;

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private storage: Storage) {
    }

    init() {
        return new Promise((resolve, reject) => {
            this.storage.get('id_token').then((token) => {
                if (token) {
                    // check token validity and that user still exists in db
                    let headers = new Headers();
                    headers.append('Authorization', token);
                    this.http
                        .post(
                            `${this.config.get('API')}/user/check`, null,
                            { headers: headers }
                        )
                        .map(res => res.json())
                        .subscribe((res: any) => {
                            if (res.success) {
                                this.parseUser(res.data);
                                this.token = token;
                                resolve(this.user);
                            } else {
                                this.cleanUser();
                                reject('User not found');
                            }
                        }, err => reject(err));
                } else {
                    reject('Token missing');
                }
            });
        });
    }

    login(email, password) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this.http.post(`${this.config.get('API')}/auth`, JSON.stringify({
            email,
            password
        }), { headers: headers }).map(res => res.json()).subscribe(
            (res: any) => {
                this.parseLoginResponse(res);
            },
            (err: Response) => {
                this.events.publish('alert:error', err.text());
            }
        );
    }

    loginFacebook(): Promise<FacebookLoginResponse> {
        return Facebook.login([
            'public_profile',
            'email'
        ]).then((res) => {
            if (res.status === 'connected') {
                const accessToken = res.authResponse.accessToken;

                return this.http.get(`${this.config.get('API')}/auth/facebook?access_token=${accessToken}`)
                    .toPromise()
                    .then(
                        (res: Response) => this.parseLoginResponse(res.json()),
                        (err: Response) => {
                            this.events.publish('alert:error', err.text());
                            return err;
                        });

            } else if (res.status === 'not_authorized') {
                // the user is logged in to Facebook,
                // but has not authenticated your app
                throw new Error('You must authorize PetMates app.');
            } else {
                // the user isn't logged in to Facebook.
                throw new Error('Please login to Facebook.');
            }
        }).catch(err => {
            this.events.publish('alert:error', err);
        });
    }

    signup(data) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http
            .post(
                `${this.config.get('API')}/auth/signup`,
                JSON.stringify(data),
                { headers: headers }
            )
            .map(res => res.json())
            .subscribe(
                (res: any) => {
                    if (res.success) {
                        this.login(data.email, data.password);
                    } else {
                        this.events.publish('alert:error', 'Username or email already registered');
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err);
                }
            );
    }

    update(data) {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            this.http
                .put(
                    `${this.config.get('API')}/user`,
                    JSON.stringify(data),
                    { headers: headers }
                )
                .map(res => res.json())
                .subscribe(
                    (res: any) => {
                        if (res.success) {
                            if (res.data) {
                                this.parseUser(res.data);
                            }
                            resolve(this.user);
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject(res.msg);
                        }
                    },
                    (err) => {
                        this.events.publish('alert:error', err.text());
                        reject(err.text());
                    }
                );
        });
    }

    deleteProfile() {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        this.http
            .delete(`${this.config.get('API')}/user`,
                { headers: headers }
            )
            .map(res => res.json())
            .subscribe(
                (res: any) => {
                    if (res.success) {
                        this.logout();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err: Response) => {
                    this.events.publish('alert:error', err.text());
                }
            );
    }

    logout() {
        this.cleanUser();
        this.events.publish('user:logout');
    }

    getPetIndexById(id: string) {
        return this.user.pets.findIndex((el) => {
            return el._id === id;
        });
    }

    submitForgotRequest(email: string) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http
            .post(
                `${this.config.get('API')}/auth/forgot`,
                JSON.stringify({ email }),
                { headers: headers }
            )
            .map(res => res.json())
            .subscribe(
                (res: any) => {
                    if (res.success) {
                        this.events.publish('alert:info', res.msg);
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err);
                }
            );
    }

    checkResetToken(token: string): Observable {
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

    changePassword(token: string, password: string): Observable {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Observable(observer => {
            this.http
                .post(
                    `${this.config.get('API')}/auth/reset/${token}`,
                    JSON.stringify({ password }),
                    { headers: headers }
                )
                .map(res => res.json())
                .subscribe(
                    (res: any) => {
                        if (res.success) {
                            this.events.publish('alert:info', res.msg);
                            this.login(res.data.email, password);
                        } else {
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

    private parseLoginResponse(res) {
        if (res.success) {
            const token = res.data.token;
            this.storage.set('id_token', token);
            this.parseUser(res.data.profile);
            this.token = token;
            this.events.publish('user:login');
        } else {
            this.events.publish('alert:error', res.msg);
            return new Error(res.msg);
        }
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