import {Component, forwardRef} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {MatesService} from '../../../services/mates.service';
import {MateImage} from '../../../common/mate-image';
import {User} from '../../../models/user.model';
import {Subscription} from 'rxjs/Subscription';

@Component({
    templateUrl: 'build/pages/mates/search/mates.search.html',
    directives: [
        forwardRef(() => MateImage)
    ]
})
export class MatesSearchPage {
    searchQuery:string = '';
    search:Array<User> = []; // results

    private searchStream:Subscription;

    constructor(public mates:MatesService,
                public viewCtrl:ViewController) {
        this.searchStream = mates.search$.subscribe((res) => {
            this.search = res;
        });
    }

    public addMate(mate) {
        this.mates.add(mate).subscribe((res:any) => {
            if (res.success && res.data) {
                this.search.splice(this.search.indexOf(mate), 1);
            }
        });
    }

    onPageWillUnload() {
        this.searchStream.unsubscribe();
    }
}