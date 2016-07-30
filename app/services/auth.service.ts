import { Storage, LocalStorage, Events, Config } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs/Rx';
import { User } from '../models/user.model';
import { Facebook } from 'ionic-native';

@Injectable()
export class AuthService {
    local:Storage = new Storage(LocalStorage);
    user:User;
    token:string;

    constructor(private http:Http,
                private events:Events,
                private config:Config) {
    }

    init() {
        let myToken:string = null;

        return this.local.get('id_token').then((token) => {
            if (token) {
                myToken = token;
                // check token validity and that user still exists in db
                let headers = new Headers();
                headers.append('Authorization', token);
                return this.http.post(`${this.config.get('API')}/user/check`, null, { headers: headers }).toPromise();
            }
            return new Error('Token missing');
        }).then(
            (res:any) => {
                res = res.json();
                if (res.success) {
                    this.user = this.parseUser(res.data);
                    this.token = myToken;
                    return this.user;
                }
                this.cleanUser();
                return new Error('User not found');
            }
        );
    }

    login(name, password) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this.http.post(`${this.config.get('API')}/auth`, JSON.stringify({
            name: name,
            password: password
        }), { headers: headers }).subscribe(
            (res:any) => {
                res = res.json();
                if (res.success) {
                    let token = res.data.token;

                    this.local.set('id_token', token);
                    this.user = this.parseUser(res.data.profile);
                    this.token = token;
                    this.events.publish('user:login');
                } else {
                    this.events.publish('alert:error', res.msg);
                }
            },
            (err:Response) => {
                this.events.publish('alert:error', err.text());
            }
        );
    }

    loginFacebook() {
        Facebook.login(['public_profile', 'email']).then((res) => {
                console.log('Facebook.login', res);

                if (res.status === 'connected') {
                    // the user is logged in and has authenticated your
                    // app, and response.authResponse supplies
                    // the user's ID, a valid access token, a signed
                    // request, and the time the access token
                    // and signed request each expire
                    const uid = res.authResponse.userID;
                    const accessToken = res.authResponse.accessToken;
                    return Facebook.api('me?fields=id,email,name,picture', null);

                } else if (res.status === 'not_authorized') {
                    // the user is logged in to Facebook,
                    // but has not authenticated your app
                    throw new Error('You must authorize PetMates app.');
                } else {
                    // the user isn't logged in to Facebook.
                    throw new Error('Please login to Facebook.');
                }
            }
        ).then((profile) => {
            console.log(`Facebook.api('me?fields=id,email,name,picture'`, JSON.stringify(profile));

            /**
             * TODO
             * /api/check {name}
             * or
             * /api/auth {uid || email}
             * | true -> login
             * | false -> me?fields...then(signup).then(login)
             */

        }, (err) => {
            this.events.publish('alert:error', err);
            console.error(err);
        });
    }

    signup(data) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post(`${this.config.get('API')}/auth/signup`,
            JSON.stringify(data),
            { headers: headers }
        ).subscribe(
            (res:any) => {
                res = res.json();
                if (res.success) {
                    this.login(data.name, data.password);
                } else {
                    this.events.publish('alert:error', 'Username or email already registered');
                }
            },
            (err) => {
                this.events.publish('alert:error', err);
            }
        );
    }

    update(user) {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        headers.append('Content-Type', 'application/json');

        return new Observable((observer) => {
            this.http.put(`${this.config.get('API')}/user`,
                JSON.stringify(user),
                { headers: headers }
            ).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        this.user = this.parseUser(res.data);
                        this.user.password = ''; // reset password field
                        observer.next();
                    } else {
                        this.events.publish('alert:error', 'Username or email already registered');
                        observer.error(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err.text());
                },
                () => observer.complete()
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
            .subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        this.logout();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err:Response) => {
                    this.events.publish('alert:error', err.text());
                }
            );
    }

    logout() {
        this.cleanUser();
        this.events.publish('user:logout');
    }

    getPetIndexById(id:string) {
        return this.user.pets.findIndex((el) => {
            return el._id === id;
        });
    }

    submitForgotRequest(email:string) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post(`${this.config.get('API')}/auth/forgot`,
            JSON.stringify({ email: email }),
            { headers: headers }
        ).subscribe(
            (res:any) => {
                res = res.json();
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

    checkResetToken(token:string):Observable {
        return new Observable(observer => {
            this.http.get(`${this.config.get('API')}/auth/reset/${token}`).subscribe(
                (res:any) => {
                    res = res.json();
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

    changePassword(token:string, password:string):Observable {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Observable(observer => {
            this.http.post(`${this.config.get('API')}/auth/reset/${token}`,
                JSON.stringify({ password: password }),
                { headers: headers }
            ).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        this.events.publish('alert:info', res.msg);
                        this.login(res.data.name, password);
                    }
                    else {
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

    private cleanUser() {
        this.local.remove('id_token');
        this.user = null;
        this.token = null;
    }

    private parseUser(user) {
        if (user) {
            delete user.password;

            if (user.pets) {
                user.pets.forEach((pet) => new Pet(pet));
            }
            if (!user.mates) {
                user.mates = [];
            }
        }
        return user;
    }
}