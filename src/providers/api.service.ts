import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Config, Platform } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../app/state';
import { makeFileRequest } from '../utils/common';

@Injectable()
export class ApiService {
    private token: string;

    constructor(private http: Http,
                private config: Config,
                private platform: Platform,
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

    upload(image, onSuccess, onError) {
        if (this.platform.is('cordova')) {
            // mobile
            const options = new FileUploadOptions();
            options.fileKey = 'picture';
            options.headers = { 'Authorization': this.token };

            const ft = new FileTransfer();
            ft.upload(image, `${this.config.get('API')}/upload`,
                res => onSuccess(JSON.parse(res.response)),
                onError,
                options
            );
        } else {
            // web
            makeFileRequest(`${this.config.get('API')}/upload`, image, this.token)
                .then(onSuccess, onError);
        }
    }

    private getHeaders(secure: boolean = true) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (secure && this.token) {
            headers.append('Authorization', this.token);
        }
        return headers;
    }
}
