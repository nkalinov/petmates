import {forwardRef} from 'angular2/core';
import {Page, ViewController} from 'ionic-angular';
import {MatesService} from '../../../services/mates.service';
import {MateImage} from '../../../common/mate-image';

@Page({
    providers: [MatesService],
    templateUrl: 'build/pages/mates/search/mates.search.html',
    directives: [
        forwardRef(() => MateImage)
    ]
})
export class MatesSearchPage {
    searchQuery:string = '';

    constructor(public mates:MatesService,
                private viewCtrl:ViewController) {
    }

    public addMate(mate) {
        this.mates.add(mate).subscribe((res) => {
            if (res.success) {
                // this.items.splice(this.items.indexOf(mate), 1);
            }
        });
    }

    public close() {
        this.viewCtrl.dismiss();
    }
}