import { ViewController, NavParams, ModalController, AlertController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { MateImage } from '../../../common/mate-image';
import { Conversation } from '../../../models/conversation.model';
import { ChatService } from '../../../providers/chat.service';
import { ConversationEditMembersPage } from './conversation.edit.members';
import { MateViewPage } from '../../mates/view/mate.view';

@Component({
    directives: [MateImage],
    templateUrl: 'conversation.edit.html'
})

export class ConversationEditPage {
    conversation: Conversation;

    constructor(public viewCtrl: ViewController,
                private chat: ChatService,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private nav: NavController,
                navParams: NavParams) {
        this.conversation = new Conversation(navParams.get('conversation'));
    }

    saveConversation() {
        this.chat.createOrUpdateConversation(this.conversation)
            .then(() => this.nav.pop());
    }

    addMatesModal() {
        this.modalCtrl.create(ConversationEditMembersPage, {
            conversation: this.conversation
        }).present();
    }

    leaveConversation() {
        const alert = this.alertCtrl.create({
            title: `Leave ${this.conversation.name || 'conversation'}?`,
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
                            .then(() => this.nav.popToRoot());
                    }
                }
            ]
        });
        alert.present();
    }

    viewMate(id: string) {
        this.nav.push(MateViewPage, { id });
    }
}
