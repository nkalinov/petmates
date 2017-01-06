import { Tab } from 'ionic-angular';
import { QueryList, ViewChildren, Component, AfterViewInit } from '@angular/core';
import { AuthService } from '../../providers/auth.service';
import { MatesService } from '../../providers/mates.service';
import { MatesAcceptedPage } from './tabs/accepted/mates.accepted';
import { MatesRequestedPage } from './tabs/requested/mates.requested';
import { MatesPendingPage } from './tabs/pending/mates.pending';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'mates.html'
})

export class MatesPage implements AfterViewInit {
    @ViewChildren(Tab)
    tabs: QueryList<Tab>;

    tabAccepted = MatesAcceptedPage;
    tabRequested = MatesRequestedPage;
    tabNew = MatesPendingPage;

    private pendingRequestsBadgeSubscription: Subscription;

    constructor(public auth: AuthService,
                private mates: MatesService) {
    }

    ngAfterViewInit() {
        this.pendingRequestsBadgeSubscription = this.mates.pending$.subscribe((length) => {
            // set new requests badge
            setTimeout(() => {
                this.tabs.last.tabBadge = length > 0 ? length.toString() : null;
            });
        });
    }

    ionViewWillLeave() {
        this.pendingRequestsBadgeSubscription.unsubscribe();
    }
}
