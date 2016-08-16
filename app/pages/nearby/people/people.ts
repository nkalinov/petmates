import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NearbyService } from '../../../services/nearby.service';

@Component({
    templateUrl: 'build/pages/nearby/people/people.html',
})

export class PeoplePage {

    constructor(private navCtrl: NavController,
                private nearby: NearbyService) {

    }

    ionViewDidEnter() {
        this.nearby.getPeople();
    }
}
