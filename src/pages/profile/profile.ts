import { AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../providers/auth.service';
import { ProfileEdit } from './edit/profile.edit';

@Component({
    templateUrl: 'profile.html'
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
