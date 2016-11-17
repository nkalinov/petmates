import { Component, Input } from '@angular/core';
import { Config } from 'ionic-angular';

@Component({
    selector: 'mate-image',
    template: `
        <img *ngIf="src" [attr.src]="src">
        <ion-icon *ngIf="!src" name="people"></ion-icon>
    `
})

export class MateImage {
    @Input('image') image;
    src: string;

    constructor(private config: Config) {
    }

    ngOnChanges() {
        if (!this.image) {
            return this.src = this.config.get('images').mate;
        } else if (this.image === 'group') {
            return;
            // this.src = this.config.get('defaultGroupChatImage');
        }
        this.src = this.image;
    }
}
