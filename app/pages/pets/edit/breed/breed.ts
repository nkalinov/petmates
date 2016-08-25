import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { BreedService } from '../../../../services/breed.service';
import { Pet } from '../../../../models/pet.model';

@Component({
    templateUrl: 'build/pages/pets/edit/breed/breed.html',
})

export class BreedPage {
    pet: Pet;
    selectedBreed: string;
    filteredItems: Array<any> = [];
    allItems: Array<any> = [];

    constructor(public viewCtrl: ViewController,
                private breeds: BreedService,
                navParams: NavParams) {
        this.pet = navParams.get('pet');
        breeds.getAll().then(res => {
            this.allItems = res;
            this.filteredItems = res;
        });
    }

    getItems(ev: any) {
        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() !== '') {
            this.filteredItems = this.allItems.filter(
                item => item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
            );
        } else {
            this.filteredItems = this.allItems;
        }
    }

    onSelectBreed(breedId: string) {
        if (breedId) {
            let newBreed = this.breeds.findBreedById(breedId);
            if (newBreed) {
                // is it actually a change ?
                // todo find another way - this is ugly
                if (this.pet.breed.name !== newBreed.name) {
                    this.pet.breed.name = newBreed.name;
                    this.viewCtrl.dismiss();
                }
            }
        }
    }
}
