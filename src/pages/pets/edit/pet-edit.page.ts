import { ViewController, NavParams, AlertController, NavController, ModalController } from 'ionic-angular';
import { Component, OnDestroy } from '@angular/core';
import { Pet } from '../../../models/Pet';
import { BreedPage } from './breed/breed';
import { IResponseUpload } from '../../../models/interfaces/IResponseUpload';
import { PetsActions } from '../pets.actions';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';
import { PetsEffects } from '../pets.effects';
import { Observable } from 'rxjs';

@Component({
    templateUrl: 'pet-edit.page.html'
})
export class PetEditPage implements OnDestroy {
    pet: Pet;
    index: number;

    private _close$;

    constructor(navParams: NavParams,
                public viewCtrl: ViewController,
                private nav: NavController,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private store: Store<AppState>,
                private petsEffects: PetsEffects) {
        this.pet = new Pet(navParams.get('pet'));
        this.index = navParams.get('index');

        this._close$ = Observable
            .merge(
                this.petsEffects.create$,
                this.petsEffects.update$,
                this.petsEffects.remove$
            )
            .filter(({ type }) =>
                [
                    PetsActions.CREATE_SUCCESS,
                    PetsActions.UPDATE_SUCCESS,
                    PetsActions.REMOVE_SUCCESS
                ].indexOf(type) > -1
            )
            .subscribe(() => {
                if (this.nav.canGoBack()) {
                    this.nav.pop();
                } else {
                    this.viewCtrl.dismiss();
                }
            });
    }

    ngOnDestroy() {
        this._close$.unsubscribe();
    }

    save() {
        this.store.dispatch(PetsActions.save(this.pet, this.index));
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
                        alert.dismiss();
                        this.store.dispatch(PetsActions.remove(this.pet._id, this.index));
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
}
