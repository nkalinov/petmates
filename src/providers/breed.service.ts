import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { IBreed } from '../models/interfaces/IBreed';
import { AuthService } from './auth.service';

@Injectable()
export class BreedService {
    private cache: IBreed[];

    constructor(private http: Http,
                private events: Events,
                private auth: AuthService,
                private config: Config) {
    }

    findBreedById(id: string): IBreed {
        if (this.cache) {
            return this.cache.find(breed => breed._id === id);
        }
    }

    getAll(): Promise<IBreed[]> {
        return new Promise((resolve, reject) => {
            if (this.cache) {
                resolve(this.cache);
            } else {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);
                this.http.get(`${this.config.get('API')}/breeds`, { headers })
                    .map(res => res.json())
                    .subscribe(
                        res => {
                            if (res.success) {
                                this.cache = res.data;
                                resolve(this.cache);
                            } else {
                                this.events.publish('alert:error', res.msg);
                                reject();
                            }
                        },
                        err => {
                            this.events.publish('alert:error', err.text());
                            reject(err.text());
                        }
                    );
            }
        });
    }
}
