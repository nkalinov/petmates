import { Component, Input, OnDestroy } from '@angular/core';
import { getTimeAgo } from '../utils/common';
import { Store } from '@ngrx/store';
import { AppState } from '../app/state';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'last-activity',
    template: `
        <span *ngIf="time">
        {{prefix}} {{time}}
    </span>`
})

export class LastActivity implements OnDestroy {
    @Input() userId: string;
    @Input() prefix: string = 'Active';
    time: string;
    timestamp: number;

    private interval;
    private subscription: Subscription;

    constructor(private store: Store<AppState>) {
    }

    ngOnChanges() {
        if (this.userId) {
            this.start();
        }
    }

    ngOnDestroy() {
        this.dispose();
    }

    calc() {
        this.time = getTimeAgo(this.timestamp);
    }

    private start() {
        this.dispose();

        this.subscription = this.store.select(state => state.lastActivities[this.userId])
            .subscribe(timestamp => {
                this.timestamp = timestamp;
                this.calc();
            });

        this.interval = setInterval(() => {
            this.calc();
        }, 60 * 1000);
    }

    private dispose() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

