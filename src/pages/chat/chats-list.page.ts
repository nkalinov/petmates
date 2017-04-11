import { NavController, ModalController, Refresher } from 'ionic-angular';
import { Component, OnDestroy } from '@angular/core';
import { ChatViewPage } from './view/chat-view.page';
import { ConversationEditPage } from './edit/conversation.edit';
import { ChatActions } from './chat.actions';
import { AppState } from '../../app/state';
import { Store } from '@ngrx/store';
import { ChatService } from '../../providers/chat.service';
import { AuthService } from '../auth/auth.service';
import { Actions } from '@ngrx/effects';
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'chats-list.page.html'
})

export class ChatsListPage implements OnDestroy {
    private subscription: Subscription;

    constructor(private modalCtrl: ModalController,
                private nav: NavController,
                private store: Store<AppState>,
                private actions$: Actions,
                public chatService: ChatService,
                public authService: AuthService) {

        this.subscription = this.chatService.chats$.subscribe(chats => {
            if (!chats
                || !chats.length
                || !chats.filter(c => !c.fromSocket).length) {
                this.store.dispatch(ChatActions.requestList());
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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

    openConversation(chatId: string) {
        this.nav.push(ChatViewPage, { chatId });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
