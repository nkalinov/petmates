import { forwardRef, Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { MateImage } from '../../../../common/mate-image';
import { MatesService } from '../../../../providers/mates.service';
import { MateViewPage } from '../../view/mate.view';
import { MatesSearchPage } from '../../search/mates.search';

@Component({
    directives: [forwardRef(() => MateImage)],
    templateUrl: 'mates.pending.html'
})

export class MatesPendingPage {
    constructor(public mates: MatesService,
                private modalCtrl: ModalController,
                private nav: NavController) {
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }

    openSearchMateModal() {
        this.modalCtrl.create(MatesSearchPage).present();
    }
}
