import { ViewController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { WalkService } from '../../../providers/walk.service';
import { PetEditPage } from '../../pets/edit/pet-edit.page';

@Component({
    templateUrl: 'StartWalkPage.html'
})

export class StartWalkPage {
    selectedPet: string;

    constructor(private modalCtrl: ModalController,
                public auth: AuthService,
                public walk: WalkService,
                public viewCtrl: ViewController) {
    }

    start() {
        this.walk.start(this.selectedPet);
        this.viewCtrl.dismiss();
    }

    petCreateModal() {
        this.modalCtrl.create(PetEditPage).present();
    }
}
