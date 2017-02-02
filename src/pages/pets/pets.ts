import { ModalController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PetEditPage } from './edit/PetEditPage';

@Component({
    selector: 'pets-list',
    templateUrl: 'pets.html'
})
export class PetsPage {

    constructor(public auth: AuthService,
                private nav: NavController,
                private modalCtrl: ModalController) {
    }

    petEdit(pet) {
        this.nav.push(PetEditPage, { pet });
    }

    petCreateModal() {
        this.modalCtrl.create(PetEditPage).present();
    }
}
