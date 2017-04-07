import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import icons from '../../utils/icons';

@Component({
    selector: 'mate-image',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="image-container" *ngIf="src" [style.background-image]="'url(' + src + ')'"></div>
        <ion-icon *ngIf="!src" name="people"></ion-icon>
    `
})

export class MateImage {
    @Input() image: string;
    src: string;

    static GROUP = 'group';

    ngOnChanges() {
        if (!this.image) {
            this.src = icons.user;
            return;
        } else if (this.image === MateImage.GROUP) {
            return;
        }
        this.src = this.image;
    }
}
