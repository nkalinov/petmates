import { forwardRef, Inject, Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { Pet } from '../models/Pet';
import { NearbyPet } from '../models/NearbyPet';
import { IResponse } from '../models/interfaces/IResponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';
import { ApiService } from './api.service';

@Injectable()
export class PetService {
    nearby$: BehaviorSubject<NearbyPet[]> = new BehaviorSubject([]);

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private config: Config,
                private location: LocationService,
                private events: Events) {
    }

    save(pet: Pet) {
        let req;
        return new Promise((resolve, reject) => {
            if (pet._id) {
                // update
                req = this.http.put(`${this.config.get('API')}/pets/${pet._id}`, pet);
            } else {
                // create
                req = this.http.post(`${this.config.get('API')}/pets`, pet);
            }
            req.subscribe(
                res => {
                    if (res.success) {
                        if (!pet._id) {
                            // create
                        }
                        // this.auth.user.pets = res.data.map(p => new Pet(p));
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
            this.http
                .delete(`/pets/${pet._id}`)
                .subscribe(
                    (res: IResponse) => {
                        if (res.success) {
                            // this.auth.user.pets = res.data.map(p => new Pet(p));
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
                this.http
                    .get(`/nearby/pets?coords=${coords}`)
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
