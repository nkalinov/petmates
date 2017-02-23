import { ViewController, NavParams, AlertController, NavController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { PetsService } from '../pets.service';
import { Pet } from '../../../models/Pet';
import { BreedPage } from './breed/breed';
import { IResponseUpload } from '../../../models/interfaces/IResponseUpload';
import { PetsActions } from '../pets.actions';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';

@Component({
    templateUrl: 'pet-edit.page.html'
})
export class PetEditPage {
    pet: Pet;
    index: number;

    constructor(navParams: NavParams,
                public viewCtrl: ViewController,
                private nav: NavController,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private store: Store<AppState>,
                private petActions: PetsActions) {

        this.pet = new Pet(navParams.get('pet'));
        this.index = navParams.get('index');
    }

    save() {
        this.store.dispatch(this.petActions.save(this.pet, this.index));
        this.goBack();
    }

    remove() {
        const alert = this.alertCtrl.create({
            title: 'Removing ' + this.pet.name,
            message: 'Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        // this.petService.deletePet(this.pet)
                        //     .then(() => alert.dismiss())
                        //     .then(() => {
                        //         this.goBack();
                        //     });
                    }
                }
            ]
        });
        alert.present();
    }

    selectBreed() {
        this.modalCtrl.create(BreedPage, { pet: this.pet }).present();
    }

    onUploadSuccess(res: IResponseUpload) {
        this.pet.pic = res.data.url;
        this.pet.picture = res.data.filename;
    }

    private goBack() {
        if (this.nav.canGoBack()) {
            this.nav.pop();
        } else {
            this.viewCtrl.dismiss();
        }
    }
}
