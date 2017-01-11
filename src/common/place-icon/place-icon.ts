import { Component, Input } from '@angular/core';
import { PlaceType } from '../../models/place.model';
import icons from '../icons';

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
    color: string = 'primary2';

    ngOnInit() {
        // todo mixed place icon or no icon
        switch (this.type[0]) {
            case PlaceType[PlaceType.vet]:
                this.src = icons.vet;
                break;
            case PlaceType[PlaceType.shop]:
                this.icon = 'cart';
                break;
            case PlaceType[PlaceType.bar]:
                this.icon = 'beer';
                break;
            case PlaceType[PlaceType.park]:
                this.icon = 'leaf';
                break;
            case PlaceType[PlaceType.restaurant]:
                this.icon = 'restaurant';
                break;
            case PlaceType[PlaceType.hotel]:
                this.icon = 'home';
                break;
            case PlaceType[PlaceType.school]:
                this.icon = 'school';
                break;
        }
    }
}

