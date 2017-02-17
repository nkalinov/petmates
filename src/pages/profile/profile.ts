import { AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ProfileEdit } from './edit/profile.edit';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { User } from '../../models/User';
import { AuthActions } from '../auth/auth.actions';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'profile.html'
})

export class ProfilePage {
    user: User;
    private subscription: Subscription;

    constructor(public authActions: AuthActions,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private actionSheetCtrl: ActionSheetController,
                private store: Store<AppState>) {

        this.subscription = this.store.select(state => state.auth.user).subscribe(user => {
            this.user = user;
        });
    }

    editModal() {
        this.modalCtrl.create(ProfileEdit, { user: this.user }).present();
    }

    openDangerSheet() {
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Delete profile',
                    role: 'destructive',
                    handler: () => {
                        this.alertCtrl.create({
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
                                        this.store.dispatch(this.authActions.deleteProfile());
                                    }
                                }
                            ]
                        }).present();
                    }
                },
                {
                    text: 'Logout',
                    handler: () => {
                        this.store.dispatch(this.authActions.logout());
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

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
