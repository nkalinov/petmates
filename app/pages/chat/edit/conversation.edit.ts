import {Page, ViewController, NavParams, NavController, Modal, App, Alert} from 'ionic-angular';
import {Component} from '@angular/core';
import {MateImage} from '../../../common/mate-image';
import {Conversation} from '../../../models/conversation.model';
import {ChatService} from '../../../services/chat.service';
import {ConversationEditMembersPage} from './conversation.edit.members';
import {ConversationsListPage} from '../conversations.list';

@Component({
    directives: [MateImage],
    templateUrl: 'build/pages/chat/edit/conversation.edit.html'
})

export class ConversationEditPage {
    conversation:Conversation;

    constructor(public viewCtrl:ViewController,
                private chat:ChatService,
                private nav:NavController,
                private app:App,
                navParams:NavParams) {
        this.conversation = new Conversation(navParams.get('conversation'));
    }

    saveConversation() {
        if (!this.conversation._id) {
            this.chat.createConversation(this.conversation).subscribe(() => {
                this.viewCtrl.dismiss();
            });
        } else {
            this.chat.updateConversation(this.conversation).subscribe((updatedConversation) => {
                this.viewCtrl.dismiss(updatedConversation);
            });
        }
    }

    addMatesModal() {
        this.nav.present(Modal.create(ConversationEditMembersPage, {
            conversation: this.conversation
        }));
    }

    leaveConversation() {
        let alert = Alert.create({
            title: 'Leave conversation ' + (this.conversation.name || '') + '?',
            message: 'Are you sure?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.chat.leaveConversation(this.conversation).subscribe(() => {
                            setTimeout(() => {
                                this.viewCtrl.dismiss();
                                let nav:NavController = this.app.getRootNav();
                                nav.setRoot(ConversationsListPage);
                            }, 1000);
                        });
                    }
                }
            ]
        });
        this.nav.present(alert);
    }
}