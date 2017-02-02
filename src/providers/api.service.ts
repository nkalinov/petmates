import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Events, Config } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../app/state';

@Injectable()
export class ApiService {
    token: string;

    constructor(private http: Http,
                private events: Events,
                private config: Config,
                private store: Store<AppState>) {

        this.store.select(state => state.auth).subscribe(auth => {
            this.token = auth.token;
        });
    }

    get(url: string, secure: boolean = true) {
        return this.http
            .get(`${this.config.get('API')}${url}`, {
                headers: this.getHeaders(secure)
            })
            .map(res => res.json());
    }

    post(url: string, data: any, secure: boolean = true, headers?: Headers) {
        return this.http
            .post(`${this.config.get('API')}${url}`, data ? JSON.stringify(data) : null, {
                headers: headers || this.getHeaders(secure)
            })
            .map(res => res.json());
    }

    put(url: string, data: any, secure: boolean = true, headers?: Headers) {
        return this.http
            .put(`${this.config.get('API')}${url}`, data ? JSON.stringify(data) : null, {
                headers: headers || this.getHeaders(secure)
            })
            .map(res => res.json());
    }

    delete(url: string, secure: boolean = true) {
        return this.http
            .delete(`${this.config.get('API')}${url}`, {
                headers: this.getHeaders(secure)
            })
            .map(res => res.json());
    }

    private getHeaders(secure: boolean = true) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (secure) {
            headers.append('Authorization', this.token);
        }
        return headers;
    }
}
