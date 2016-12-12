import { ModalController, NavController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../../providers/auth.service';
import { Pet } from '../../../models/pet.model';

@Component({
    templateUrl: 'pet.view.html'
})
export class PetViewPage {
    pet: Pet;

    constructor(public auth: AuthService,
                private nav: NavController,
                private navParams: NavParams,
                private modalCtrl: ModalController) {
        this.pet = navParams.get('pet');
    }
}
