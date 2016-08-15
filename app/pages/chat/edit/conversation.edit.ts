import { ViewController, NavParams, ModalController, App, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateImage } from '../../../common/mate-image';
import { Conversation } from '../../../models/conversation.model';
import { ChatService } from '../../../services/chat.service';
import { ConversationEditMembersPage } from './conversation.edit.members';

@Component({
    directives: [MateImage],
    templateUrl: 'build/pages/chat/edit/conversation.edit.html'
})

export class ConversationEditPage {
    conversation: Conversation;

    constructor(public viewCtrl: ViewController,
                private chat: ChatService,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private app: App,
                navParams: NavParams) {
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
        this.modalCtrl.create(ConversationEditMembersPage, {
            conversation: this.conversation
        }).present();
    }

    leaveConversation() {
        const alert = this.alertCtrl.create({
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
                        this.chat.leaveConversation(this.conversation)
                            .then(() => alert.dismiss())
                            .then(() => this.viewCtrl.dismiss())
                            .then(() => this.app.getActiveNav().pop());
                    }
                }
            ]
        });
        alert.present();
    }
}
