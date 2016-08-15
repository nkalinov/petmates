import { NavController, ModalController } from 'ionic-angular';
import { SlicePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MateImage } from '../../common/mate-image';
import { ChatService } from '../../services/chat.service';
import { ConversationPage } from './view/conversation';
import { ConversationEditPage } from './edit/conversation.edit';
import { Conversation } from '../../models/conversation.model';
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

    openConversation(c: Conversation) {
        this.nav.push(ConversationPage, {
            conversation: c
        });
    }

    createConversation() {
        this.modalCtrl.create(ConversationEditPage).present();
    }
}
