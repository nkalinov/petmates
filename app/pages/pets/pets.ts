import { ModalController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PetEditPage } from './edit/pet.edit';
import { GenderInfo } from '../../common/gender';
import { AgeInfo } from '../../common/age';
import { PetImage } from '../../common/pet-image';

@Component({
    selector: 'pets-list',
    templateUrl: 'build/pages/pets/pets.html',
    directives: [GenderInfo, AgeInfo, PetImage]
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
