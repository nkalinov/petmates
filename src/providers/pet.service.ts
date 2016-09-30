import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { APIResponse } from '../models/APIResponse.interface';

@Injectable()
export class PetService {
    constructor(public auth: AuthService,
                private http: Http,
                private config: Config,
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
}
