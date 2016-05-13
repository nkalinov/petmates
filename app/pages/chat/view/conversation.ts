import {Page, NavParams, NavController, Content, Modal} from 'ionic-angular';
import {forwardRef, ViewChild} from 'angular2/core';
import {ChatService} from '../../../services/chat.service.ts';
import {AuthService} from '../../../services/auth.service.ts';
import {MateImage} from '../../../common/mate-image';
import {Message} from '../../../models/message.model.ts';
import {MessageTimePipe} from '../../../pipes/message.time.pipe.ts';
import {Conversation} from '../../../models/conversation.model.ts';
import {ConversationEditPage} from "../edit/conversation.edit";

@Page({
    templateUrl: 'build/pages/chat/view/conversation.html',
    directives: [forwardRef(() => MateImage)],
    pipes: [MessageTimePipe]
})

export class ConversationPage {
    @ViewChild(Content) content:Content;
    conversation:Conversation;
    message:Message;

    constructor(public auth:AuthService,
                public chats:ChatService,
                private nav:NavController,
                navParams:NavParams) {
        this.conversation = navParams.get('conversation');
        this.newMessage();

        // load conversation messages
        this.chats.getMessages(this.conversation).subscribe((res) => {
            this.scrollToBottom();
        }, () => nav.pop());
    }

    onPageWillUnload() {
        this.conversation.newMessages = 0; // read messages
    }

    editConversation() {
        let modal = Modal.create(ConversationEditPage, {
            conversation: this.conversation
        });
        this.nav.present(modal);
        modal.onDismiss((updatedConversation) => {
            if (updatedConversation) {
                this.conversation = updatedConversation;
            }
        });
    }

    sendMessage() {
        this.chats.send(this.message, this.conversation).subscribe((res) => {
            if (res.success) {
                this.newMessage();
                this.scrollToBottom();
            }
        });
    }

    scrollToBottom() {
        this.conversation.newMessages = 0; // read messages
        setTimeout(() => {
            this.content.scrollToBottom();
        });
    }

    private newMessage() {
        this.message = new Message({
            author: this.auth.user
        })
    }
}