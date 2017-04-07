import { NavController, ModalController, Refresher } from 'ionic-angular';
import { Component } from '@angular/core';
import { ChatViewPage } from './view/chat-view.page';
import { ConversationEditPage } from './edit/conversation.edit';
import { Conversation } from '../../models/Conversation';
import { Observable } from 'rxjs';
import { ChatActions } from './chat.actions';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { ChatService } from '../../providers/chat.service';
import { AuthService } from '../auth/auth.service';
import { merge } from 'lodash';
import { Actions } from '@ngrx/effects';

@Component({
    templateUrl: 'chats-list.page.html'
})

export class ChatsListPage {
    chats$: Observable<Conversation[]>;

    constructor(private modalCtrl: ModalController,
                private nav: NavController,
                private store: Store<AppState>,
                private actions$: Actions,
                public chatService: ChatService,
                public authService: AuthService) {

        this.chats$ = this.store.select(state => state.chats)
            .withLatestFrom(this.store.select(state => state.entities.users))
            .map(([chats, users]) => chats.map(chat => {
                // populate
                let copy = merge({}, chat);
                copy.members = copy.members.map(member => users[<string>member]);
                if (copy.lastMessage) {
                    copy.lastMessage.author = users[<string>chat.lastMessage.author];
                }
                return copy;
            }));

        this.store.dispatch(ChatActions.requestList());
    }

    doRefresh(refresher: Refresher) {
        const subscription = this.actions$
            .ofType(ChatActions.LIST_REQ_SUCCESS)
            .subscribe(() => {
                refresher.complete();
                if (subscription) {
                    // todo why undefined ?
                    subscription.unsubscribe();
                }
            });
        this.store.dispatch(ChatActions.requestList());
    }

    openConversation(chat: Conversation) {
        this.nav.push(ChatViewPage, { chat });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
