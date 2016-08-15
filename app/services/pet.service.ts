import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs/Observable';
import { makeFileRequest } from './common.service';

@Injectable()
export class PetService {
    constructor(private http: Http,
                private config: Config,
                public events: Events,
                public auth: AuthService) {
    }

    save(pet: Pet): Observable<any> {
        let headers = new Headers();
        let req;
        headers.append('Authorization', this.auth.token);
        headers.append('Content-Type', 'application/json');

        return new Observable(observer => {
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
            req.subscribe(
                (res) => {
                    res = res.json();
                    if (res.success) {
                        if (!pet._id) {
                            // created --> push
                            pet._id = res.pet._id;
                            this.auth.user.pets.push(pet);
                        } else {
                            // updated --> replace
                            let index = this.auth.getPetIndexById(pet._id);
                            if (index > -1) {
                                this.auth.user.pets[index] = pet;
                            }
                        }
                        observer.next(res);
                        observer.complete();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.next(err);
                    observer.complete();
                }
            );
        });
    }

    deletePet(pet): Promise<any> {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);

        return new Promise((resolve, reject) => {
            this.http.delete(`${this.config.get('API')}/pets/${pet._id}`,
                { headers: headers }
            ).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        // remove from user.pets
                        let index = this.auth.getPetIndexById(pet._id);
                        if (index > -1) {
                            this.auth.user.pets.splice(index, 1);
                        }
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

    upload(picture, pet: Pet) {
        makeFileRequest(
            `${this.config.get('API')}/pets/${pet._id}/upload`,
            picture,
            this.auth.token
        ).then(
            (res: any) => {
                if (res.response.success) {
                    pet.pic = res.response.file.url;
                    // replace
                    let index = this.auth.getPetIndexById(pet._id);
                    if (index > -1) {
                        this.auth.user.pets[index] = pet;
                    }
                } else {
                    this.events.publish('alert:error', res.response.msg);
                }
            },
            (error) => {
                this.events.publish('alert:error', error);
            });
    }
}
