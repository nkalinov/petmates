import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { AuthService } from './auth.service';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs/Observable';
import { CommonService } from './common.service';

@Injectable()
export class PetService {
    constructor(private http:Http,
                private config:Config,
                public events:Events,
                public auth:AuthService) {
    }

    save(pet:Pet):Observable<any> {
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

    deletePet(pet) {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.delete(`${this.config.get('API')}/pets/${pet._id}`,
                { headers: headers }
            ).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        // remove from user.pets
                        let index = this.auth.getPetIndexById(pet._id);
                        if (index > -1) {
                            this.auth.user.pets.splice(index, 1);
                        }
                        observer.next(res);
                        observer.complete();
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err:Response) => {
                    this.events.publish('alert:error', err.text());
                    observer.next(err);
                    observer.complete();
                }
            );
        });
    }

    upload(picture, pet:Pet) {
        CommonService.makeFileRequest(`${this.config.get('API')}/pets/${pet._id}/upload`, picture, this.auth.token)
            .then(
                (res:any) => {
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