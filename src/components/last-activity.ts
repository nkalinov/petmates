import { Component, Input, OnDestroy } from '@angular/core';
import { Conversation } from '../models/Conversation';
import { AuthService } from '../pages/auth/auth.service';
import { getTimeAgo } from '../utils/common';

@Component({
    selector: 'last-activity',
    template: `
    <span *ngIf="time">
        {{prefix}} {{time}}
    </span>`
})

export class LastActivity implements OnDestroy {
    @Input() chat: Conversation;
    @Input() prefix: string;
    time: string;
    private interval;

    constructor(private auth: AuthService) {
    }

    ngOnChanges() {
        this.calcLastActivity();
        this.startInterval();
    }

    ngOnDestroy() {
        this.clearInterval();
    }

    calcLastActivity() {
        if (this.chat && this.chat.members && this.chat.members.length === 2) {
            let lastActive = this.chat.members
                .filter(m => m._id !== this.auth.user._id)[0]
                .lastActive;

            if (lastActive) {
                this.time = getTimeAgo(lastActive);
            }
        }
    }

    private startInterval() {
        this.clearInterval();

        this.interval = setInterval(() => {
            this.calcLastActivity();
        }, 60 * 1000);
    }

    private clearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
