import {Injectable} from '@angular/core';
import {Config, Events} from 'ionic-angular';
import {AuthService} from './auth.service';
import {Http, Headers} from '@angular/http';

export interface Place {
    name:string;
    coords:Array<number>;
    phone:string;
    hours:string;
}

@Injectable()
export class PlacesService {
    places = {
        vets: [],
        shops: []
    };

    constructor(private http:Http,
                private config:Config,
                private events:Events,
                private auth:AuthService) {
    }

    getPlaces() {
        return new Promise((resolve, reject) => {
            if (this.places.vets.length > 0) {
                resolve(this.places);
            } else {
                let headers = new Headers();
                headers.append('Authorization', this.auth.token);
                this.http.get(`${this.config.get('API')}/places`, {headers: headers}).subscribe(
                    (res:any) => {
                        res = res.json();
                        if (res.success) {
                            this.places = res.data;
                        } else {
                            this.events.publish('alert:error', res.msg);
                        }
                        resolve(this.places);
                    },
                    (err) => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
            }
        });
    }
}
