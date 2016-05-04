import {Page, Modal, NavController, Tab} from 'ionic-angular';
import {QueryList, ViewChildren} from 'angular2/core';
import {AuthService} from '../../services/auth.service';
import {MatesSearchPage} from './search/mates.search';
import {MatesService} from '../../services/mates.service';
import {MateImage} from '../../common/mate-image';
import {MateViewPage} from './view/mate.view';
import {MatesAcceptedPage} from './tabs/accepted/mates.accepted';
import {STATUS_PENDING} from '../../models/friendship.interface.ts';
import {MatesRequestedPage} from "./tabs/requested/mates.requested";

@Page({
    providers: [MatesService],
    templateUrl: 'build/pages/mates/mates.html'
})

export class MatesPage {
    @ViewChildren(Tab)
    tabs:QueryList<Tab>;

    tabAccepted:MatesAcceptedPage = MatesAcceptedPage;
    tabRequested:MatesRequestedPage = MatesRequestedPage;
    tabNew:MatesAcceptedPage = MatesAcceptedPage;

    constructor(public mates:MatesService,
                public auth:AuthService,
                private nav:NavController) {
    }

    ngAfterViewInit() {
        // set new requests badge
        let length = this.auth.user.mates.filter((mate) => {
            return mate.status === STATUS_PENDING
        }).length;

        if (length > 0) {
            this.tabs.last.tabBadge = length.toString();
        }
    }

    searchMateModal() {
        this.nav.present(Modal.create(MatesSearchPage));
    }
}