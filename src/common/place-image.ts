import { Component, Input } from '@angular/core';
import { Config } from 'ionic-angular';
import { Place, PlaceType } from '../models/place.model';

@Component({
    selector: 'place-image',
    template: `
        <img *ngIf="src" [attr.src]="src" />
        <ion-icon *ngIf="!src" [name]="iconName"></ion-icon>
    `
})

export class PlaceImage {
    @Input('view') isViewPage: boolean = false;
    @Input() place: Place;
    src: string;
    iconName: string;

    private defaultImages: any;

    constructor(config: Config) {
        this.defaultImages = config.get('images').places;
    }

    ngOnInit() {
        // if have custom pic and on view page
        if (this.place.pic && this.isViewPage) {
            this.src = this.place.pic;
            return;
        }

        // get default image (eg. vet, vetView, shop, shopView...)
        const defaultImage = this.defaultImages[
            `${this.place.type[0]}${this.isViewPage ? 'View' : ''}`
            ];

        if (defaultImage) {
            // custom default img
            this.src = defaultImage;
            return;
        }

        // fallback to icon
        switch (this.place.type[0]) {
            case PlaceType.Shop:
                return this.iconName = 'cart';
            // todo ....
        }
    }
}
