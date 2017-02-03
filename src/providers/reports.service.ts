import { forwardRef, Inject, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { ApiService } from './api.service';

@Injectable()
export class ReportsService {

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private events: Events) {
    }

    createReport(description: string, id: string, type: 'user' | 'place') {
        return new Promise((resolve, reject) => {
            this.http.post(`/reports`, { description, id, type })
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
