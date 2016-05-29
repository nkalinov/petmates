import {Component, Input} from '@angular/core';
import {Config} from 'ionic-angular';

@Component({
    selector: 'pet-image',
    template: `<img src="{{image}}">`
})

export class PetImage {
    @Input() image;

    constructor(private config:Config) {
    }

    ngOnInit() {
        if (!this.image) {
            this.image = this.config.get('defaultPetImage');
        }
    }
}