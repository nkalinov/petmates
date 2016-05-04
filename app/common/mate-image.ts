import {Component, Input} from 'angular2/core';
import {Config} from 'ionic-angular';

@Component({
    selector: 'mate-image',
    template: `<img src="{{image}}">`
})

export class MateImage {
    @Input() image;

    constructor(private config:Config) {
    }

    ngOnInit() {
        if (!this.image) {
            this.image = this.config.get('defaultMateImage');
        }
    }
}