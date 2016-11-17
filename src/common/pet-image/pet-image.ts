import { Component, Input } from '@angular/core';
import { Config } from 'ionic-angular';

@Component({
    selector: 'pet-image',
    template: `<img [attr.src]="src" />`
})

export class PetImage {
    @Input() image;
    src: string;

    constructor(private config: Config) {
    }

    ngOnChanges() {
        if (!this.image) {
            return this.src = this.config.get('images').pet;
        }
        this.src = this.image;
    }
}
