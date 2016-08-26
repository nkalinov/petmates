import { AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProfileEdit } from './edit/profile.edit';
import { MateImage } from '../../common/mate-image';
import { PetsPage } from '../pets/pets';

@Component({
    templateUrl: 'build/pages/profile/profile.html',
    directives: [MateImage, PetsPage]
})
export class ProfilePage {

    constructor(public auth: AuthService,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private actionSheetCtrl: ActionSheetController) {
    }

    editModal() {
        this.modalCtrl.create(ProfileEdit).present();
    }

    openDangerSheet() {
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete profile',
                    role: 'destructive',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            const alert = this.alertCtrl.create({
                                title: 'Confirm profile deletion',
                                message: 'Are you sure?',
                                buttons: [
                                    {
                                        text: 'Cancel',
                                        role: 'cancel'
                                    },
                                    {
                                        text: 'Delete',
                                        handler: () => {
                                            this.auth.deleteProfile();
                                        }
                                    }
                                ]
                            });
                            alert.present();
                        });
                    }
                },
                {
                    text: 'Logout',
                    handler: () => {
                        this.auth.logout();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }
}
