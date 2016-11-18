import { Component, Input } from '@angular/core';
import { PlaceType } from '../../models/place.model';

@Component({
    selector: 'place-icon',
    template: `
        <img *ngIf="src" [attr.src]="src" />
        <ion-icon *ngIf="icon" [name]="icon" [color]="color"></ion-icon>
    `
})

export class PlaceIcon {
    @Input() type: string[] = [];

    src: string;
    icon: string;
    color: string;

    ngOnInit() {
        // todo mixed place icon or no icon
        switch (this.type[0]) {
            case PlaceType[PlaceType.vet]:
                this.src = 'assets/img/hospital_marker.png';
                break;
            case PlaceType[PlaceType.shop]:
                this.icon = 'cart';
                this.color = 'primary2';
                break;
        }
    }
}

