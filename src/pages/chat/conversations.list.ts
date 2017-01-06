import { NavController, ModalController, Refresher } from 'ionic-angular';
import { Component } from '@angular/core';
import { ChatService } from '../../providers/chat.service';
import { ConversationPage } from './view/conversation';
import { ConversationEditPage } from './edit/conversation.edit';
import { AuthService } from '../../providers/auth.service';
import { Conversation } from '../../models/Conversation';

@Component({
    templateUrl: 'conversations.list.html'
})

export class ConversationsListPage {

    constructor(public chats: ChatService,
                public auth: AuthService,
                private modalCtrl: ModalController,
                private nav: NavController) {
    }

    ionViewWillEnter() {
        if (!this.chats.conversations.length) {
            this.chats.getConversations();
        }
    }

    doRefresh(refresher: Refresher) {
        this.chats.getConversations().then(
            () => refresher.complete(),
            () => refresher.complete()
        );
    }

    openConversation(conversation: Conversation) {
        this.nav.push(ConversationPage, { conversation });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
