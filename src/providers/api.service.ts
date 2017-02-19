import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Config, Platform } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../app/state';
import { makeFileRequest } from '../utils/common';
import { Observable, Observer } from 'rxjs';
import { AppActions } from '../app/app.actions';
import { ApiActions } from '../actions/api.actions';
import { IResponseUpload } from '../models/interfaces/IResponseUpload';

@Injectable()
export class ApiService {
    private token: string;

    constructor(private http: Http,
                private config: Config,
                private platform: Platform,
                private appActions: AppActions,
                private apiActions: ApiActions,
                private store: Store<AppState>) {

        this.store.select(state => state.auth.token).subscribe(token => {
            this.token = token;
        });
    }

    get(url: string, secure: boolean = true) {
        return this.http
            .get(`${this.config.get('API') || 'http://127.0.0.1/api'}${url}`, {
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

    upload(file) {
        return Observable.create((observer: Observer<IResponseUpload>) => {
            this.store.dispatch(this.apiActions.upload());

            if (this.platform.is('cordova')) {
                // mobile
                const options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = { 'Authorization': this.token };

                const ft = new FileTransfer();
                ft.upload(file, `${this.config.get('API')}/upload`,
                    // (res: FileUploadResult) => {
                    (res: any) => {
                        const response = JSON.parse(res.response);

                        if (response.success) {
                            this.store.dispatch(this.apiActions.uploadSuccess());
                            observer.next(response);
                        } else {
                            this.store.dispatch(this.appActions.error(response.msg));
                            observer.error(response);
                        }
                    },
                    // (err: FileTransferError) => {
                    (err: any) => {
                        this.store.dispatch(this.appActions.error(err.body));
                        observer.error(err);
                    },
                    options
                );
            } else {
                // web
                makeFileRequest(`${this.config.get('API')}/upload`, file, this.token)
                    .then(
                        (res: any) => {
                            const response = res.response;

                            if (response.success) {
                                this.store.dispatch(this.apiActions.uploadSuccess());
                                observer.next(response);
                            } else {
                                this.store.dispatch(this.appActions.error(response.msg));
                                observer.error(response);
                            }
                        },
                        err => {
                            this.store.dispatch(this.appActions.error(err.toString()));
                            observer.error(err);
                        }
                    );
            }
        });
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
