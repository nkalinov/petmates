import {Page, ActionSheet, NavController, Alert, Modal} from 'ionic-angular';
import {AuthService} from '../../services/auth.service';
import {ProfileEdit} from "./edit/profile.edit";

@Page({
    templateUrl: 'build/pages/profile/profile.html',
})
export class ProfilePage {

    constructor(public auth:AuthService,
                private nav:NavController) {
    }

    public editModal() {
        let modal = Modal.create(ProfileEdit);
        this.nav.present(modal);
    }

    /**
     * Settings button
     */
    public openDangerSheet() {
        let actionSheet = ActionSheet.create({
            buttons: [
                {
                    text: 'Delete profile',
                    role: 'destructive',
                    handler: () => {
                        let alert = Alert.create({
                            title: 'Confirm profile deletion',
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
                                        this.auth.deleteProfile();
                                    }
                                }
                            ]
                        });
                        this.nav.present(alert);
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
        this.nav.present(actionSheet);
    }
}