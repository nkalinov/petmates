import { NavParams, NavController, Content, ActionSheetController, Platform } from 'ionic-angular';
import { ViewChild, Component, ElementRef } from '@angular/core';
import { ChatService } from '../../../providers/chat.service';
import { AuthService } from '../../auth/auth.service';
import { Message } from '../../../models/Message';
import { Conversation } from '../../../models/Conversation';
import { ConversationEditPage } from '../edit/conversation.edit';
import { ImagePicker } from 'ionic-native';

@Component({
    selector: 'conversation-page',
    templateUrl: 'conversation.html'
})
export class ConversationPage {
    @ViewChild(Content) content: Content;
    @ViewChild('fileInput') fileInput: ElementRef;
    conversation: Conversation;
    message: Message;

    constructor(public auth: AuthService,
                public chats: ChatService,
                private nav: NavController,
                private navParams: NavParams,
                private actionSheetCtrl: ActionSheetController,
                private platform: Platform) {
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

        // this.chats.getMessages(this.conversation).then(() => {
        //     this.scrollToBottom(0);
        // }, () => this.nav.pop());
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
        if (this.message.msg.length || this.message.picture) {
            this.chats.send(this.message, this.conversation).then(() => {
                this.newMessage();
                this.scrollToBottom();
            });
        }
    }

    sendPhoto() {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Send Photo',
            buttons: [
                {
                    text: 'Choose Existing Photo',
                    handler: () => {
                        if (this.platform.is('cordova')) {
                            ImagePicker.getPictures({
                                maximumImagesCount: 1,
                                width: 500,
                                height: 500
                            })
                                .then(images => this.chats.upload(images[0], this.message))
                                .then(() => this.sendMessage());
                        } else {
                            // web
                            this.fileInput.nativeElement.click();
                        }
                    }
                },
                {
                    text: 'Take Photo',
                    handler: () => {

                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    fileChangeEvent(fileInput: any) {
        this.chats
            .upload(fileInput.target.files[0], this.message)
            .then(() => this.sendMessage());
    }

    scrollToBottom(duration = 300) {
        this.conversation.newMessages = 0; // read messages
        setTimeout(() => {
            this.content.scrollToBottom(duration);
        });
    }

    private newMessage() {
        this.message = new Message({ author: this.auth.user });
    }
}
