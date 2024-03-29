import {
    ViewController, NavParams, AlertController, NavController, ModalController, Config,
    Events
} from 'ionic-angular';
import { ImagePicker } from 'ionic-native';
import { Component } from '@angular/core';
import { PetService } from '../../../providers/pet.service';
import { Pet } from '../../../models/Pet';
import { BreedPage } from './breed/breed';
import { makeFileRequest } from '../../../utils/common';
import { AuthService } from '../../../providers/auth.service';

@Component({
    templateUrl: 'PetEditPage.html'
})
export class PetEditPage {
    pet: Pet;

    constructor(navParams: NavParams,
                public viewCtrl: ViewController,
                private pets: PetService,
                private auth: AuthService,
                private config: Config,
                private nav: NavController,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private events: Events) {
        this.pet = new Pet(navParams.get('pet'));
    }

    save() {
        this.pets.save(this.pet).then(() => {
            this.goBack();
        });
    }

    remove() {
        const alert = this.alertCtrl.create({
            title: 'Removing ' + this.pet.name,
            message: 'Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.pets.deletePet(this.pet)
                            .then(() => alert.dismiss())
                            .then(() => {
                                this.goBack();
                            });
                    }
                }
            ]
        });
        alert.present();
    }

    selectBreed() {
        this.modalCtrl.create(BreedPage, { pet: this.pet }).present();
    }

    changePicture() {
        ImagePicker.getPictures({
            maximumImagesCount: 1,
            width: 500,
            height: 500
        }).then(images => {
                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = {
                    'Authorization': this.auth.token
                };
                let ft = new FileTransfer();
                ft.upload(images[0], encodeURI(`${this.config.get('API')}/upload`),
                    res => {
                        const parsed = JSON.parse(res.response);

                        if (parsed.success) {
                            this.pet.pic = parsed.data.url;
                            this.pet.picture = parsed.data.filename;
                        } else {
                            this.events.publish('alert:error', parsed.msg);
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.body);
                    }, options);
            },
            err => {
                this.events.publish('alert:error', err);
            });
    }

    private goBack() {
        if (this.nav.canGoBack()) {
            this.nav.pop();
        } else {
            this.viewCtrl.dismiss();
        }
    }

    // dev
    public fileChangeEvent(fileInput: any) {
        makeFileRequest(
            `${this.config.get('API')}/upload`,
            fileInput.target.files[0],
            this.auth.token
        ).then(
            (res: any) => {
                if (res.response.success) {
                    this.pet.pic = res.response.data.url;
                    this.pet.picture = res.response.data.filename;
                } else {
                    this.events.publish('alert:error', res.response.msg);
                }
            },
            err => console.error(err));
    }
}
