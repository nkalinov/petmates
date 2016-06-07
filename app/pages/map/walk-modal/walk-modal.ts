import {ViewController} from 'ionic-angular';
import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {WalkService} from '../../../services/walk.service.ts';
import {PetsPage} from '../../pets/pets';
import {AgeInfo} from '../../../common/age';
import {GenderInfo} from '../../../common/gender';
import {PetImage} from '../../../common/pet-image';

@Component({
    directives: [GenderInfo, AgeInfo, PetImage],
    templateUrl: 'build/pages/map/walk-modal/walk-modal.html'
})

export class WalkModal {
    selectedPet:string;
    PetsPage:PetsPage;

    constructor(public auth:AuthService,
                public walk:WalkService,
                public viewCtrl:ViewController) {
    }

    start() {
        this.walk.start(this.selectedPet);
        this.viewCtrl.dismiss();
    }
}