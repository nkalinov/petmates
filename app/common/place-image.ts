import { Component, Input } from '@angular/core';
import { Config } from 'ionic-angular';
import { Place } from '../models/place.model';

@Component({
    selector: 'place-image',
    template: `
        <img *ngIf="src" src="{{src}}">
        <ion-icon *ngIf="!src && place.type === 'shop'" name="cart"></ion-icon>
    `
})

export class PlaceImage {
    @Input('card') isCard: boolean = false;
    @Input() place: Place;
    src: string;

    constructor(private config: Config) {
    }

    ngOnInit() {
        if (this.place.pic && this.isCard) {
            this.src = this.place.pic;
            return;
        }

        switch (this.place.type) {
            case 'vet':
                this.src = this.isCard ?
                    this.config.get('defaultVetCardImage') :
                    this.config.get('defaultVetImage');
                break;
            // todo fallback to ion-icon [cart] for now
            // case 'shop':
            //     this.src = this.config.get('defaultShopImage');
            //     break;
        }
    }
}
