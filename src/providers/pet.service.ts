import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { APIResponse } from '../models/APIResponse.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';

@Injectable()
export class PetService {
    pets$ = new BehaviorSubject([]);
    pets: Pet[] = [];

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
                (res: APIResponse) => {
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
        if (force || !this.pets.length) {
            return this.location.getGeolocation().then(coords => this.getNearbyPets(coords, force));
        } else {
            return Promise.resolve();
        }
    }

    getNearbyPets(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || !this.pets.length) {

                let headers = new Headers();
                headers.append('Authorization', this.auth.token);

                this.http
                    .get(`${this.config.get('API')}/nearby/pets?coords=${coords}`, { headers: headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            this.pets = res.data.map(u => new Pet(u));
                            this.pets$.next(this.pets);
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
