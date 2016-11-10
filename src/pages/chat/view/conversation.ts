import { NavParams, NavController, Content } from 'ionic-angular';
import { ViewChild, Component } from '@angular/core';
import { ChatService } from '../../../providers/chat.service';
import { AuthService } from '../../../providers/auth.service';
import { Message } from '../../../models/message.model';
import { Conversation } from '../../../models/conversation.model';
import { ConversationEditPage } from '../edit/conversation.edit';

@Component({
    selector: 'conversation-page',
    templateUrl: 'conversation.html'
})
export class ConversationPage {
    @ViewChild(Content) content: Content;
    conversation: Conversation;
    message: Message;

    constructor(public auth: AuthService,
                public chats: ChatService,
                private nav: NavController,
                private navParams: NavParams) {
        this.newMessage();
        this.conversation = this.navParams.get('conversation');

        // get other member's lastActivity
        if (this.conversation.members.length === 2) {
            const otherMemberIndex = this.conversation.members.findIndex(m => m._id !== this.auth.user._id),
                otherMember = this.conversation.members[otherMemberIndex];

            const find = this.auth.user.mates.find(
                m => m.friend._id === otherMember._id
            );
            if (find) {
                otherMember.lastActive = find.friend.lastActive;
            }
        }

        this.chats.getMessages(this.conversation).then(() => {
            this.scrollToBottom(0);
        }, () => this.nav.pop());
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
        const author = {
            _id: this.auth.user._id,
            name: this.auth.user.name,
            pic: this.auth.user.pic
        };
        this.message = new Message({ author });
    }
}
