import { ImagePicker } from 'ionic-native';
import { ViewController, Events, Config, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../../providers/auth.service';
import { User } from '../../../models/user.model';
import { makeFileRequest } from '../../../providers/common.service';
import { LocationService } from '../../../providers/location.service';

@Component({
    templateUrl: 'profile.edit.html'
})

export class ProfileEdit {
    user: User;

    constructor(private viewCtrl: ViewController,
                private auth: AuthService,
                private location: LocationService,
                private loadingCtrl: LoadingController,
                private config: Config,
                private events: Events) {
        this.user = new User(this.auth.user);
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    geoLocalizeMe() {
        this.location.getLocation().then(location => {
            this.user.location.coordinates = location.coordinates;
            this.user.city = location.city;
            this.user.country = location.country;
        });
    }

    save() {
        const { name, email, picture, password, location, city, country } = this.user;
        this.auth.update({ name, email, picture, password, location, city, country }).then(() => {
            this.cancel();
        });
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
                options.headers = {
                    'Authorization': this.auth.token
                };
                const ft = new FileTransfer();
                ft.upload(
                    images[0],
                    encodeURI(`${this.config.get('API')}/upload`),
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

    // dev
    fileChangeEvent(fileInput: any) {
        makeFileRequest(`${this.config.get('API')}/upload`, fileInput.target.files[0], this.auth.token).then(
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
