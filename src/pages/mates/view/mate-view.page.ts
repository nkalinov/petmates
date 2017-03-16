import { NavParams, NavController, AlertController, ModalController } from 'ionic-angular';
import { Component, OnDestroy } from '@angular/core';
import { MatesService } from '../mates.service';
import { User } from '../../../models/User';
import { STATUS_ACCEPTED, STATUS_PENDING, STATUS_REQUESTED } from '../../../models/interfaces/IFriendship';
import { ReportModalPage } from '../../../components/report-modal/report-modal';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app/state';
import { MatesActions } from '../mates.actions';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
    templateUrl: 'mate-view.page.html'
})

export class MateViewPage implements OnDestroy {
    friend = new User();
    pets$;
    status: string;
    friendshipStatuses = {
        accepted: STATUS_ACCEPTED,
        pending: STATUS_PENDING,
        requested: STATUS_REQUESTED
    };
    private data$;

    constructor(private navParams: NavParams,
                private authService: AuthService,
                private navController: NavController,
                private matesService: MatesService,
                private modalCtrl: ModalController,
                private store: Store<AppState>) {
        const id = this.navParams.get('id');

        this.data$ = Observable.combineLatest(
            this.store.select(state => state.entities.users[id]),
            this.store.select(state => state.entities.pets),
            this.matesService.mates$
        ).subscribe(values => {
            const [friend, pets, mates] = values,
                mate = mates.find(mate => mate.friend._id === id);

            this.friend = friend;
            this.pets$ = Observable.of(friend.pets.map(petId => pets[petId]));
            this.status = mate && mate.status;
        });

        this.store.dispatch(MatesActions.getUserDetails(id));
    }

    ngOnDestroy() {
        this.data$.unsubscribe();
    }

    viewMate(id: string) {
        this.navController.push(MateViewPage, { id });
    }

    addMate() {
        this.store.dispatch(MatesActions.add(this.authService.userId, this.friend._id));
    }

    removeMate() {
        this.matesService.alertRemove(this.friend);
    }

    report() {
        this.modalCtrl.create(ReportModalPage, {
            id: this.friend._id,
            type: 'user'
        }).present();
    }
}
