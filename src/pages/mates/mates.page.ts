import { Tab } from 'ionic-angular';
import { QueryList, ViewChildren, Component, AfterViewInit } from '@angular/core';
import { MatesService } from './mates.service';
import { MatesAcceptedPage } from './tabs/accepted/mates-accepted.page';
import { MatesRequestedPage } from './tabs/requested/mates.requested';
import { MatesPendingPage } from './tabs/pending/mates.pending';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'mates.page.html'
})

export class MatesPage implements AfterViewInit {
    @ViewChildren(Tab) tabs: QueryList<Tab>;
    tabAccepted = MatesAcceptedPage;
    tabRequested = MatesRequestedPage;
    tabNew = MatesPendingPage;
    private pendingRequestsBadgeSubscription: Subscription;

    constructor(public matesService: MatesService) {
    }

    ngAfterViewInit() {
        this.pendingRequestsBadgeSubscription = this.matesService.pending$.subscribe((mates) => {
            setTimeout(() => {
                this.tabs.last.tabBadge = mates.length ? mates.length.toString() : null;
            });
        });
    }

    ionViewWillLeave() {
        this.pendingRequestsBadgeSubscription.unsubscribe();
    }
}
