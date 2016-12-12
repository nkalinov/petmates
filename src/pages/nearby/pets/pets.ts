import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { PetService } from '../../../providers/pet.service';
import { PetViewPage } from '../../pets/view/pet.view';
import { Pet } from '../../../models/pet.model';

@Component({
    templateUrl: 'pets.html'
})

export class NearbyPetsPage {
    constructor(private navCtrl: NavController,
                private pets: PetService) {
    }

    ionViewDidEnter() {
        this.pets.getLocationThenNearbyPets();
    }

    viewPet(pet: Pet) {
        this.navCtrl.push(PetViewPage, { pet });
    }

    doRefresh(refresher: Refresher) {
        this.pets.getLocationThenNearbyPets(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
