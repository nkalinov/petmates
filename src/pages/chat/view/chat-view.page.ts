import { NavParams, NavController, Content, ActionSheetController, Platform } from 'ionic-angular';
import { ViewChild, Component, ElementRef } from '@angular/core';
import { ChatService } from '../../../providers/chat.service';
import { AuthService } from '../../auth/auth.service';
import { Message } from '../../../models/Message';
import { Conversation } from '../../../models/Conversation';
import { ConversationEditPage } from '../edit/conversation.edit';
import { ImagePicker } from '@ionic-native/image-picker';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app/state';
import { ChatActions } from '../chat.actions';

@Component({
    selector: 'chat-view-page',
    templateUrl: 'chat-view.page.html'
})

export class ChatViewPage {
    @ViewChild(Content) content: Content;
    @ViewChild('fileInput') fileInput: ElementRef;
    chat: Conversation;
    message: Message;

    constructor(public auth: AuthService,
                public chatService: ChatService,
                private nav: NavController,
                private navParams: NavParams,
                private imagePicker: ImagePicker,
                private actionSheetCtrl: ActionSheetController,
                private platform: Platform,
                private store: Store<AppState>) {

        this.newMessage();
        this.chat = this.navParams.get('chat'); // todo get from store by id

        // get other member's lastActivity
        // if (this.chat.members.length === 2) {
        //     const otherMemberIndex = this.conversation.members.findIndex(m => m._id !== this.auth.user._id),
        //         otherMember = this.conversation.members[otherMemberIndex];
        //
        //     const find = this.auth.user.mates.find(m => m.friend._id === otherMember._id);
        //     if (find) {
        //         otherMember.lastActive = find.friend.lastActive;
        //     }
        // }

        if (!this.chat.messages.length) {
            this.store.dispatch(ChatActions.requestMessages(this.chat._id));
        }

        // this.chats.getMessages(this.conversation).then(() => {
        //     this.scrollToBottom(0);
        // }, () => this.nav.pop());
    }

    ionViewWillLeave() {
        this.chat.newMessages = 0; // read messages
    }

    editConversation() {
        this.nav.push(ConversationEditPage, {
            conversation: this.chat
        });
    }

    sendMessage() {
        if (this.message.msg.length || this.message.picture) {
            this.store.dispatch(ChatActions.sendMessage(this.message, this.chat._id));
            // this.chatService.send(this.message, this.chat).then(() => {
            //     this.newMessage();
            //     this.scrollToBottom();
            // });
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
                            this.imagePicker.getPictures({
                                maximumImagesCount: 1,
                                width: 500,
                                height: 500
                            })
                                .then(images => this.chatService.upload(images[0], this.message))
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
        this.chatService
            .upload(fileInput.target.files[0], this.message)
            .then(() => this.sendMessage());
    }

    scrollToBottom(duration = 300) {
        this.chat.newMessages = 0; // read messages
        setTimeout(() => {
            this.content.scrollToBottom(duration);
        });
    }

    private newMessage() {
        this.message = new Message({ author: this.auth.user });
    }
}
