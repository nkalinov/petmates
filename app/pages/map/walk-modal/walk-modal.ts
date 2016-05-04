import {Page, ViewController} from 'ionic-angular';
import {AuthService} from '../../../services/auth.service';
import {WalkService} from '../../../services/walk.service.ts';
import {PetsPage} from '../../pets/pets';
import {AgeInfo} from '../../../common/age';
import {GenderInfo} from '../../../common/gender';

@Page({
    directives: [GenderInfo, AgeInfo],
    templateUrl: 'build/pages/map/walk-modal/walk-modal.html'
})

export class WalkModal {
    selectedPet:string;
    PetsPage:PetsPage;

    constructor(public auth:AuthService,
                public walk:WalkService,
                public viewCtrl:ViewController) {
    }

    start(e) {
        this.walk.start(this.selectedPet);
        this.viewCtrl.dismiss();
        return false;
    }
}