import { Tab } from 'ionic-angular';
import { QueryList, ViewChildren, Component, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatesService } from '../../services/mates.service';
import { MatesAcceptedPage } from './tabs/accepted/mates.accepted';
import { MatesRequestedPage } from './tabs/requested/mates.requested';
import { MatesPendingPage } from './tabs/pending/mates.pending';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'build/pages/mates/mates.html'
})

export class MatesPage implements AfterViewInit {
    @ViewChildren(Tab)
    tabs:QueryList<Tab>;
    tabAccepted:MatesAcceptedPage = MatesAcceptedPage;
    tabRequested:MatesRequestedPage = MatesRequestedPage;
    tabNew:MatesPendingPage = MatesPendingPage;

    private pendingRequestsBadgeSubscription:Subscription;

    constructor(public auth:AuthService,
                private mates:MatesService) {
    }

    ngAfterViewInit() {
        this.pendingRequestsBadgeSubscription = this.mates.pending$.subscribe((length) => {
            // set new requests badge
            this.tabs.last.tabBadge = length > 0 ? length.toString() : undefined;
        });
    }

    ionViewWillUnload() {
        this.pendingRequestsBadgeSubscription.unsubscribe();
    }
}
