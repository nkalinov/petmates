import { NavController, ModalController, Refresher } from 'ionic-angular';
import { SlicePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MateImage } from '../../common/mate-image';
import { ChatService } from '../../services/chat.service';
import { ConversationPage } from './view/conversation';
import { ConversationEditPage } from './edit/conversation.edit';
import { AuthService } from '../../services/auth.service';
import { LastActivity } from '../../common/last-activity';

@Component({
    pipes: [SlicePipe],
    directives: [MateImage, LastActivity],
    templateUrl: 'build/pages/chat/conversations.list.html'
})
export class ConversationsListPage {
    constructor(public chats: ChatService,
                public auth: AuthService,
                private modalCtrl: ModalController,
                private nav: NavController) {
        // todo cond ok ?
        if (chats.conversations.length === 0) {
            chats.getConversations();
        }
    }

    doRefresh(refresher: Refresher) {
        this.chats.getConversations().then(
            () => refresher.complete(),
            () => refresher.complete()
        );
    }

    openConversation(id: string) {
        this.nav.push(ConversationPage, { id });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
