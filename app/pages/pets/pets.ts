import {Page, Modal, IonicApp, NavController} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {AuthService} from '../../services/auth.service';
import {PetEditPage} from './edit/pet.edit';
import {GenderInfo} from '../../common/gender';
import {AgeInfo} from '../../common/age';
import {PetImage} from '../../common/pet-image';

@Page({
    templateUrl: 'build/pages/pets/pets.html',
    directives: [
        forwardRef(() => GenderInfo),
        forwardRef(() => AgeInfo),
        forwardRef(() => PetImage)
    ]
})
export class PetsPage {
    private nav:NavController;

    constructor(private app:IonicApp,
                public auth:AuthService) {
        this.nav = this.app.getActiveNav();
    }

    public petEdit(pet) {
        this.nav.push(PetEditPage, {pet: pet});
    }

    public petCreateModal() {
        this.nav.present(Modal.create(PetEditPage));
    }
}
