import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Config, Events } from 'ionic-angular';
import { AuthService } from './auth.service';

@Injectable()
export class ReportsService {

    constructor(private http: Http,
                private config: Config,
                private events: Events,
                private auth: AuthService) {
    }

    createReport(description: string, id: string, type: 'user' | 'place') {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);
            headers.append('Content-Type', 'application/json');

            this.http.post(`${this.config.get('API')}/reports`, JSON.stringify({
                description,
                id,
                type
            }), { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            this.events.publish('alert:info', 'Report sent successfully.');
                            resolve();
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
        });
    }
}
