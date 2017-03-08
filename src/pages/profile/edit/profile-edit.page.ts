import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { User } from '../../../models/User';
import { LocationService } from '../../../providers/location.service';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../auth/auth.actions';
import { IResponseUpload } from '../../../models/interfaces/IResponseUpload';

@Component({
    templateUrl: 'profile-edit.page.html'
})

export class ProfileEdit {
    user: User;

    constructor(public viewCtrl: ViewController,
                private location: LocationService,
                private store: Store<AppState>,
                navParams: NavParams) {
        this.user = Object.assign({}, navParams.get('user'));
    }

    geoLocalizeMe() {
        this.location.getLocation().then(location => {
            this.user.location.coordinates = location.coordinates;
            this.user.city = location.city;
            this.user.region = location.region;
            this.user.country = location.country;
        });
    }

    save() {
        this.store.dispatch(AuthActions.update(this.user));
        // todo close only AFTER successful update
        this.viewCtrl.dismiss();
    }

    onUploadSuccess(res: IResponseUpload) {
        this.user.pic = res.data.url;
        this.user.picture = res.data.filename;
    }
}
