import { NavParams, NavController, Content, ModalController } from 'ionic-angular';
import { forwardRef, ViewChild, Component } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { MateImage } from '../../../common/mate-image';
import { Message } from '../../../models/message.model';
import { Conversation } from '../../../models/conversation.model';
import { ConversationEditPage } from '../edit/conversation.edit';
import { LastActivity } from '../../../common/last-activity';

@Component({
    templateUrl: 'build/pages/chat/view/conversation.html',
    directives: [
        forwardRef(() => MateImage),
        forwardRef(() => LastActivity)
    ]
})
export class ConversationPage {
    @ViewChild(Content) content: Content;
    conversation: Conversation;
    message: Message;

    constructor(public auth: AuthService,
                public chats: ChatService,
                private modalCtrl: ModalController,
                nav: NavController,
                navParams: NavParams) {
        this.conversation = navParams.get('conversation');
        this.newMessage();

        // load conversation messages
        this.chats.getMessages(this.conversation).then(() => {
            this.scrollToBottom(0);
        }, () => nav.pop());
    }

    ionViewWillLeave() {
        this.conversation.newMessages = 0; // read messages
    }

    editConversation() {
        const modal = this.modalCtrl.create(ConversationEditPage, {
            conversation: this.conversation
        });
        modal.present();
        modal.onDidDismiss(updatedConversation => {
            if (updatedConversation) {
                this.conversation = updatedConversation;
            }
        });
    }

    sendMessage() {
        this.chats.send(this.message, this.conversation).then((res: any) => {
            if (res.success) {
                this.newMessage();
                this.scrollToBottom();
            }
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
