import {Page, ViewController, Events, Config} from 'ionic-angular/index';
import {AuthService} from '../../../services/auth.service';
import {User} from '../../../models/user.model.ts';
import {Camera} from 'ionic-native';
import {Http} from 'angular2/http';
import {CommonService} from "../../../services/common.service";

@Page({
    templateUrl: 'build/pages/profile/edit/profile.edit.html'
})

export class ProfileEdit {
    user:User;
    picture:any;

    constructor(private viewCtrl:ViewController,
                private auth:AuthService,
                private config:Config,
                private events:Events) {
        this.user = (JSON.parse(JSON.stringify(this.auth.user))); // clone
    }

    public cancel() {
        this.viewCtrl.dismiss();
    }

    public save() {
        this.auth.update(this.user)
            .subscribe(() => {
                this.viewCtrl.dismiss();
            })
    }

    public changePicture() {
        if ((<any>navigator).camera && FileTransfer) {
            Camera.getPicture({
                destinationType: 1, // 0=DATA_URL 1=FILE_URI
                cameraDirection: 1, // FRONT
                // targetWidth: 600,
                // targetHeight: 300,
            }).then((imageData) => {
                    var options = new FileUploadOptions();
                    options.fileKey = 'picture';
                    options.headers = {
                        'Authorization': this.auth.token
                    };
                    var ft = new FileTransfer();
                    ft.upload(imageData, encodeURI(`${this.config.get('API')}/user/upload`),
                        (res) => {
                            console.log(res);
                            res.response = JSON.parse(res.response);

                            if (res.response.success) {
                                // change img src and update token
                                this.user.pic = res.response.file.url;
                                this.auth.user.pic = this.user.pic;
                            } else {
                                this.events.publish('alert:error', res.response.msg);
                            }
                        },
                        (err) => {
                            this.events.publish('alert:error', err.text());
                        }, options);
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                });
        }
    }

    // dev
    public fileChangeEvent(fileInput:any) {
        this.picture = <Array<File>> fileInput.target.files[0];
        this.upload();
    }

    // dev
    private upload() {
        CommonService.makeFileRequest(`${this.config.get('API')}/user/upload`, this.picture, this.auth.token).then(
            (res) => {
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