import { AlertController, ActionSheetController, ModalController } from 'ionic-angular';
import { Component, OnDestroy } from '@angular/core';
import { ProfileEdit } from './edit/profile-edit.page';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { User } from '../../models/User';
import { AuthActions } from '../auth/auth.actions';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Pet } from '../../models/Pet';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'profile',
    templateUrl: 'profile.page.html'
})

export class ProfilePage implements OnDestroy {
    user: User;
    pets$: Observable<Pet[]>;
    private user$: Subscription;

    constructor(private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private actionSheetCtrl: ActionSheetController,
                private store: Store<AppState>,
                private authService: AuthService) {

        this.user$ = this.authService.user$.subscribe(user => {
            this.user = user;
        });

        this.pets$ = Observable.combineLatest(
            this.authService.user$,
            this.store.select(state => state.entities.pets),
            (user, pets) => (user && user.pets || []).map(petId => pets[petId])
        );
    }

    ngOnDestroy() {
        this.user$.unsubscribe();
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
                                        this.store.dispatch(AuthActions.remove());
                                    }
                                }
                            ]
                        }).present();
                    }
                },
                {
                    text: 'Logout',
                    handler: () => {
                        this.store.dispatch(AuthActions.logout());
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
