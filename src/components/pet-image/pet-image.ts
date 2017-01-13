import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'pet-image',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img [attr.src]="src" />`
})

export class PetImage {
    @Input() image: string;
    src: string;

    ngOnChanges() {
        if (!this.image) {
            this.src = 'assets/img/default_pet.jpg';
            return;
        }
        this.src = this.image;
    }
}
