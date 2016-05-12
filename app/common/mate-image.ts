import {Component, Input} from 'angular2/core';
import {Config} from 'ionic-angular';

@Component({
    selector: 'mate-image',
    template: `<img *ngIf="src" src="{{src}}"><ion-icon *ngIf="!src" name="people"></ion-icon>`
})

export class MateImage {
    @Input() image;
    src:string;

    constructor(private config:Config) {
    }

    ngOnInit() {
        if (!this.image) {
            this.src = this.config.get('defaultMateImage');
        } else if (this.image === 'group') {
            return;
            // this.src = this.config.get('defaultGroupChatImage');
        } else {
            this.src = this.image;
        }
    }
}