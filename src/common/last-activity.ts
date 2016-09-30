import { Component, Input, OnDestroy } from '@angular/core';
import { Conversation } from '../models/conversation.model';
import { User } from '../models/user.model';
import { AuthService } from '../providers/auth.service';
import { getTimeAgo } from '../providers/common.service';

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
        this.startInterval();
        setTimeout(() => {
            this.calcLastActivity();
        }, 1000);
    }

    ngOnDestroy() {
        this.clearInterval();
    }

    calcLastActivity() {
        if (this.chat && this.chat.members && this.chat.members.length === 2) {
            let lastActive = this.chat.members
                .filter((m: User) => m._id !== this.auth.user._id)[0]
                .lastActive;

            if (lastActive) {
                setTimeout(() => {
                    this.time = getTimeAgo(lastActive);
                }, 1000);
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
