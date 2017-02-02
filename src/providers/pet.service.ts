import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { AuthService } from '../pages/auth/auth.service';
import { Pet } from '../models/Pet';
import { NearbyPet } from '../models/NearbyPet';
import { IResponse } from '../models/interfaces/IResponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';

@Injectable()
export class PetService {
    nearby$: BehaviorSubject<NearbyPet[]> = new BehaviorSubject([]);

    constructor(public auth: AuthService,
                private http: Http,
                private config: Config,
                private location: LocationService,
                private events: Events) {
    }

    save(pet: Pet) {
        let headers = new Headers();
        let req;
        headers.append('Authorization', this.auth.token);
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            if (pet._id) {
                // update
                req = this.http.put(`${this.config.get('API')}/pets/${pet._id}`,
                    JSON.stringify(pet),
                    { headers: headers }
                );
            } else {
                // create
                req = this.http.post(`${this.config.get('API')}/pets`,
                    JSON.stringify(pet),
                    { headers: headers }
                );
            }
            req.map(res => res.json()).subscribe(
                res => {
                    if (res.success) {
                        if (!pet._id) {
                            // create
                        }
                        this.auth.user.pets = res.data.map(p => new Pet(p));
                        resolve();
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                err => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    deletePet(pet) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/pets/${pet._id}`,
                { headers: headers }
            ).map(res => res.json()).subscribe(
                (res: IResponse) => {
                    if (res.success) {
                        this.auth.user.pets = res.data.map(p => new Pet(p));
                        resolve(res);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                (err: Response) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    getLocationThenNearbyPets(force = false) {
        if (force || !this.nearby$.getValue().length) {
            return this.location.getGeolocation().then(coords => this.getNearbyPets(coords, force));
        } else {
            return Promise.resolve();
        }
    }

    getNearbyPets(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || !this.nearby$.getValue().length) {

                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(`${this.config.get('API')}/nearby/pets?coords=${coords}`, { headers: headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            this.nearby$.next(
                                res.data.map(u => new NearbyPet(u))
                            );
                            resolve();
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                resolve();
            }
        });
    }
}
