import { Component, Input } from '@angular/core';

@Component({
    selector: 'pet-image',
    template: `<img [attr.src]="src" />`
})

export class PetImage {
    @Input() image;
    src: string;

    ngOnChanges() {
        if (!this.image) {
            this.src = 'assets/img/default_pet.jpg';
            return;
        }
        this.src = this.image;
    }
}
