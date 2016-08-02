import { ImagePicker } from 'ionic-native';
import { ViewController, Events, Config } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { CommonService } from '../../../services/common.service';
import { MateImage } from '../../../common/mate-image';

@Component({
    templateUrl: 'build/pages/profile/edit/profile.edit.html',
    directives: [MateImage]
})

export class ProfileEdit {
    user: User;
    picture: any;
    locationModel: string;

    constructor(private viewCtrl: ViewController,
                private auth: AuthService,
                private config: Config,
                private events: Events) {
        this.user = Object.assign({}, this.auth.user);
        if (this.user.location.coordinates.length > 0) {
            this.locationModel = this.user.city + ', ' + this.user.country;
        }
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    geoLocalizeMe() {
        this.auth.getLocation().then(location => {
            this.user.location = location;
            this.locationModel = location.city + ', ' + location.country;
        });
    }

    save() {
        this.auth.update(this.user).then(() => {
            this.viewCtrl.dismiss();
        });
    }

    changePicture() {
        ImagePicker.getPictures({
            // max images to be selected, defaults to 15. If this is set to 1, upon
            // selection of a single image, the plugin will return it.
            maximumImagesCount: 1,

            // max width and height to allow the images to be.  Will keep aspect
            // ratio no matter what.  So if both are 800, the returned image
            // will be at most 800 pixels wide and 800 pixels tall.  If the width is
            // 800 and height 0 the image will be 800 pixels wide if the source
            // is at least that wide.
            width: 200,
            height: 200,

            // quality of resized image, defaults to 100
            quality: 60
        }).then((images) => {
            for (let i = 0; i < images.length; i++) {
                console.log('Image URI: ' + images[i]);
            }
            if (images) {
                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = {
                    'Authorization': this.auth.token
                };
                const ft = new FileTransfer();
                ft.upload(images[0], encodeURI(`${this.config.get('API')}/user/upload`),
                    (res: any) => {
                        res.response = JSON.parse(res.response);

                        if (res.response.success) {
                            // change img src
                            this.user.pic = res.response.file.url;
                            this.auth.user.pic = this.user.pic;
                        } else {
                            this.events.publish('alert:error', res.response.msg);
                        }
                    },
                    (err) => {
                        this.events.publish('alert:error', err.text());
                    }, options);
            }
        }, (err) => {
            this.events.publish('alert:error', err);
        });
    }

    // dev
    fileChangeEvent(fileInput: any) {
        this.picture = <Array<File>> fileInput.target.files[0];
        this.upload();
    }

    // dev
    private upload() {
        CommonService.makeFileRequest(`${this.config.get('API')}/user/upload`, this.picture, this.auth.token).then(
            (res: any) => {
                if (res.response.success) {
                    this.user.pic = res.response.file.url;
                    this.auth.user.pic = this.user.pic;
                } else {
                    this.events.publish('alert:error', res.response.msg);
                }
            },
            (error) => {
                console.error(error);
            });
    }
}
