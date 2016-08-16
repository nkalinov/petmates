import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { Config, Events } from 'ionic-angular';
import { User } from '../models/user.model';
import 'rxjs/add/operator/map';

@Injectable()
export class NearbyService {
    nearby$;

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private auth: AuthService) {
    }

    getPeople() {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);

        this.http.get(`${this.config.get('API')}/nearby/people`, {
            headers: headers
        }).map(res => res.json()).subscribe((res: any) => {
            this.nearby$.next(
                res.data.map(u => new User(u, this.auth.user.location.coordinates))
            );
        }, (err) => {
            this.events.publish('alert:error', err.text());
        });
    }
}

