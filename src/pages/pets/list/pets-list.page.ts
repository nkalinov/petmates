import { ModalController, NavController } from 'ionic-angular';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PetEditPage } from '../edit/pet-edit.page';
import { Pet } from '../../../models/Pet';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'pets-list',
    templateUrl: 'pets-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PetsListPage {
    @Input() pets: Observable<Pet[]>;
    @Input() userId: string;
    @Input() canCreate: boolean = false;

    constructor(private nav: NavController,
                private modalCtrl: ModalController) {
    }

    petEdit(pet: Pet) {
        if (this.canCreate) {
            this.nav.push(PetEditPage, {
                pet,
                userId: this.userId
            });
        } else {
            // todo PetViewPage
        }
    }

    petCreateModal() {
        if (this.canCreate) {
            this.modalCtrl.create(PetEditPage, {
                userId: this.userId
            }).present();
        }
    }
}
