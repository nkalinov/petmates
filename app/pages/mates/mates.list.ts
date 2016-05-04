import {Page, Modal, NavController} from 'ionic-angular';
import {AuthService} from '../../services/auth.service';
import {MatesSearch} from './search/mates.search';
import {MatesService} from '../../services/mates.service';

@Page({
    providers: [MatesService],
    templateUrl: 'build/pages/mates/mates.list.html'
})

export class MatesList {

    constructor(public auth:AuthService,
                private nav:NavController,
                public mates:MatesService) {
    }

    public searchMateModal() {
        let modal = Modal.create(MatesSearch);
        this.nav.present(modal);
    }
}