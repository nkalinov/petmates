import { ModalController, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PetEditPage } from './edit/PetEditPage';
import { Pet } from '../../models/Pet';

@Component({
    selector: 'pets-list',
    templateUrl: 'pets.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PetsPage {
    @Input()
    pets: Pet[];

    @Input()
    canCreate: boolean = false;

    constructor(public auth: AuthService,
                private nav: NavController,
                private modalCtrl: ModalController) {
    }

    petEdit(pet) {
        if (this.canCreate) {
            this.nav.push(PetEditPage, { pet });
        }
    }

    petCreateModal() {
        this.modalCtrl.create(PetEditPage).present();
    }
}
