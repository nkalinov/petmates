import {Storage, LocalStorage, Events, Config} from 'ionic-angular';
import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import {Pet} from '../models/pet.model';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user.model.ts';

@Injectable()
export class AuthService {
    local:Storage = new Storage(LocalStorage);
    user:User;
    token:string;

    private isAuthenticated:boolean = false;

    constructor(private http:Http,
                private events:Events,
                private config:Config) {
    }

    init() {
        return new Promise((resolve, reject) => {
            this.local.get('id_token').then((token) => {
                if (token) {
                    // check token validity and that user still exists in db
                    let headers = new Headers();
                    headers.append('Authorization', token);
                    this.http.post(`${this.config.get('API')}/user/check`, null, {headers: headers}).subscribe(
                        (res:any) => {
                            res = res.json();
                            if (res.success) {
                                this.isAuthenticated = true;
                                this.user = this.parseUser(res.data);
                                this.token = token;
                                resolve();
                            } else {
                                // user not found
                                this.logout();
                                reject();
                            }
                        },
                        (err) => {
                            // token not valid
                            this.logout();
                            reject();
                        }
                    );
                } else {
                    this.logout();
                    reject();
                }
            }, () => {
                this.logout();
                reject();
            });
        });
    }

    authenticated() {
        return this.isAuthenticated;
    }

    login(name, password) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let req = this.http.post(`${this.config.get('API')}/auth`,
            JSON.stringify({name: name, password: password}),
            {headers: headers}
        );

        // service response logic
        req.subscribe(
            (res:any) => {
                res = res.json();
                if (res.success) {
                    let token = res.data.token;
                    this.local.set('id_token', token);
                    this.user = this.parseUser(res.data.profile);
                    this.token = token;
                    this.isAuthenticated = true;
                    this.events.publish('user:login');
                } else {
                    this.events.publish('alert:error', res.msg);
                }
            },
            (err:Response) => {
                console.log('login err', err);
                this.events.publish('alert:error', err.text());
            }
        );
        return req;
    }

    signup(data) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http
            .post(`${this.config.get('API')}/auth/signup`,
                JSON.stringify(data),
                {headers: headers}
            )
            .subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        this.login(data.name, data.password);
                    } else {
                        this.events.publish('alert:error', res.msg);
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
                {headers: headers}
            ).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        this.user = this.parseUser(res.data);
                        this.user.password = ''; // reset password field
                        observer.next();
                        observer.complete();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err);
                    observer.next();
                    observer.complete();
                }
            );
        });
    }

    deleteProfile() {
        let headers = new Headers();
        headers.append('Authorization', this.token);
        this.http
            .delete(`${this.config.get('API')}/user`,
                {headers: headers}
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
        this.local.remove('id_token');
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
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
            JSON.stringify({email: email}),
            {headers: headers}
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
                JSON.stringify({password: password}),
                {headers: headers}
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

    //////////////////////

    private parseUser(user) {
        if (user) {
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