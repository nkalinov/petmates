import { Component, Input } from '@angular/core';
import icons from '../icons';

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

    ngOnChanges() {
        if (!this.image) {
            this.src = icons.user;
            return;
        } else if (this.image === 'group') {
            return;
            // this.src = this.config.get('defaultGroupChatImage');
        }
        this.src = this.image;
    }
}
