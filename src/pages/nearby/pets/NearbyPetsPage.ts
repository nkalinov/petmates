import { Component } from '@angular/core';
import { NavController, Refresher } from 'ionic-angular';
import { PetService } from '../../../providers/pet.service';
import { NearbyPet } from '../../../models/NearbyPet';
import { MateViewPage } from '../../mates/view/MateViewPage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    templateUrl: 'NearbyPetsPage.html'
})

export class NearbyPetsPage {
    nearby$: BehaviorSubject<NearbyPet[]>;

    constructor(private navCtrl: NavController,
                private pets: PetService) {
        this.nearby$ = pets.nearby$;
    }

    ionViewDidEnter() {
        this.pets.getLocationThenNearbyPets();
    }

    viewOwner(id: string) {
        this.navCtrl.push(MateViewPage, { id });
    }

    doRefresh(refresher: Refresher) {
        this.pets.getLocationThenNearbyPets(true).then(
            () => refresher.complete(),
            err => refresher.complete()
        );
    }
}
