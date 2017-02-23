import { ModalController, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PetEditPage } from '../edit/pet-edit.page';
import { Pet } from '../../../models/Pet';

@Component({
    selector: 'pets-list',
    templateUrl: 'pets-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PetsListPage {
    @Input()
    pets: Pet[];

    @Input()
    canCreate: boolean = false;

    constructor(public auth: AuthService,
                private nav: NavController,
                private modalCtrl: ModalController) {
    }

    petEdit(pet: Pet, index: number) {
        if (this.canCreate) {
            this.nav.push(PetEditPage, { pet, index });
        }
    }

    petCreateModal() {
        this.modalCtrl.create(PetEditPage).present();
    }
}
