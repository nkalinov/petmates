import { ImagePicker } from 'ionic-native';
import { ViewController, Events, Config, LoadingController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { User } from '../../../models/User';
import { makeFileRequest } from '../../../utils/common';
import { LocationService } from '../../../providers/location.service';
import { AppState } from '../../../app/state';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../auth/auth.actions';

@Component({
    templateUrl: 'profile.edit.html'
})

export class ProfileEdit {
    user: User; // copy

    constructor(private viewCtrl: ViewController,
                private location: LocationService,
                private loadingCtrl: LoadingController,
                private config: Config,
                private events: Events,
                private store: Store<AppState>,
                private authActions: AuthActions,
                navParams: NavParams) {
        this.user = new User(navParams.get('user'));
    }

    close() {
        this.viewCtrl.dismiss();
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
        this.store.dispatch(
            this.authActions.update(this.user)
        );
        // todo close only AFTER successful update
        this.close();
    }

    changePicture() {
        ImagePicker.getPictures({
            maximumImagesCount: 1,
            width: 500,
            height: 500
        }).then(images => {
            if (images && images.length > 0) {
                const loader = this.loadingCtrl.create();
                loader.present();

                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                const ft = new FileTransfer();
                ft.upload(images[0], `${this.config.get('API')}/upload`,
                    (res: any) => {
                        res.response = JSON.parse(res.response);

                        if (res.response.success) {
                            this.user.pic = res.response.data.url;
                            this.user.picture = res.response.data.filename;
                        } else {
                            this.events.publish('alert:error', res.response.msg);
                        }

                        loader.dismiss();
                    },
                    err => {
                        this.events.publish('alert:error', err.body);
                        loader.dismiss();
                    },
                    options
                );
            }
        }, err => {
            this.events.publish('alert:error', err);
        });
    }

    fileChangeEvent(fileInput: any) {
        makeFileRequest(`${this.config.get('API')}/upload`, fileInput.target.files[0]).then(
            (res: any) => {
                if (res.response.success) {
                    this.user.pic = res.response.data.url;
                    this.user.picture = res.response.data.filename;
                } else {
                    this.events.publish('alert:error', res.response.msg);
                }
            },
            err => console.error(err));
    }
}
