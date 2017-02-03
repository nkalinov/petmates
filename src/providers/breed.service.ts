import { forwardRef, Inject, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { IBreed } from '../models/interfaces/IBreed';
import { ApiService } from './api.service';

@Injectable()
export class BreedService {
    private cache: IBreed[];

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events) {

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
                this.http.get('/breeds')
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
