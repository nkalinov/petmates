import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Events, Config} from 'ionic-angular';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Breed} from "../models/breed.interface";
import {AuthService} from "./auth.service";

@Injectable()
export class BreedService {
    breeds$:any = new BehaviorSubject([]);
    private cache:Array<Breed>;

    constructor(private http:Http,
                private events:Events,
                private auth:AuthService,
                private config:Config) {
    }

    findBreedById(id:string):Breed {
        if (this.cache) {
            return this.cache.find((el) => {
                return el._id === id
            });
        } else {
            return undefined;
        }
    }

    getAll() {
        if (!this.cache) {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            this.http.get(`${this.config.get('API')}/breeds`, {headers: headers})
                .subscribe(
                    (res:any) => {
                        res = res.json();
                        this.cache = res.data;
                        this.breeds$.next(this.cache);
                    },
                    (err) => {
                        this.events.publish('alert:error', err.text());
                    }
                );
        } else {
            this.breeds$.next(this.cache);
        }
    }
}