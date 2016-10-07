import { NavParams, NavController, Content } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { ChatService } from '../../../providers/chat.service';
import { AuthService } from '../../../providers/auth.service';
import { MateImage } from '../../../common/mate-image';
import { Message } from '../../../models/message.model';
import { Conversation } from '../../../models/conversation.model';
import { ConversationEditPage } from '../edit/conversation.edit';
import { LastActivity } from '../../../common/last-activity';

@Component({
    selector: 'conversation-page',
    templateUrl: 'conversation.html',
    directives: [MateImage, LastActivity]
})
export class ConversationPage {
    @ViewChild(Content) content: Content;
    conversation: Conversation = new Conversation();
    message: Message;

    constructor(public auth: AuthService,
                public chats: ChatService,
                private nav: NavController,
                private navParams: NavParams) {
        this.newMessage();

        // load conversation messages
        this.chats.getMessages(this.navParams.get('id')).then(() => {
            this.scrollToBottom(0);
        }, () => this.nav.pop());
    }

    ionViewWillEnter() {
        this.conversation = this.chats.findConversationById(this.navParams.get('id')) || new Conversation();
    }

    ionViewWillLeave() {
        this.conversation.newMessages = 0; // read messages
    }

    editConversation() {
        this.nav.push(ConversationEditPage, {
            conversation: this.conversation
        });
    }

    sendMessage() {
        this.chats.send(this.message, this.conversation).then(() => {
            this.newMessage();
            this.scrollToBottom();
        });
    }

    scrollToBottom(duration = 300) {
        this.conversation.newMessages = 0; // read messages
        setTimeout(() => {
            this.content.scrollToBottom(duration);
        });
    }

    private newMessage() {
        this.message = new Message({
            author: this.auth.user
        });
    }
}
