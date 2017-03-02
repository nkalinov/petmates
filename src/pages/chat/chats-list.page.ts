import { NavController, ModalController, Refresher } from 'ionic-angular';
import { Component } from '@angular/core';
import { ConversationPage } from './view/conversation';
import { ConversationEditPage } from './edit/conversation.edit';
import { Conversation } from '../../models/Conversation';
import { Observable } from 'rxjs';
import { ChatActions } from './chat.actions';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';

@Component({
    templateUrl: 'chats-list.page.html'
})

export class ConversationsListPage {
    me: string;
    chats: Observable<Conversation[]>;

    constructor(private modalCtrl: ModalController,
                private nav: NavController,
                store: Store<AppState>) {

        this.chats = store.select(state => state.chat.list);
        store.select(state => state.auth.user)
            .map(user => {
                this.me = user._id;
            });

        ChatActions.requestList();
    }

    doRefresh(refresher: Refresher) {
        // this.chats.getList().then(
        //     () => refresher.complete(),
        //     () => refresher.complete()
        // );
    }

    openConversation(conversation: Conversation) {
        this.nav.push(ConversationPage, { conversation });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
