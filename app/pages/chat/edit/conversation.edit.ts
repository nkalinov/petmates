import {Page, ViewController, NavParams, NavController, Modal} from 'ionic-angular';
import {User} from '../../../models/user.model';
import {MatesService} from '../../../services/mates.service';
import {MateImage} from '../../../common/mate-image';
import {Conversation} from "../../../models/conversation.model";
import {ChatService} from "../../../services/chat.service";
import {ConversationEditMembersPage} from "./conversation.edit.members";

@Page({
    directives: [MateImage],
    templateUrl: 'build/pages/chat/edit/conversation.edit.html'
})

export class ConversationEditPage {
    friends:Array<User> = [];
    conversation:Conversation;

    constructor(public viewCtrl:ViewController,
                private chat:ChatService,
                private nav:NavController,
                navParams:NavParams) {
        this.conversation = navParams.get('conversation') || new Conversation();
    }

    save() {

    }

    createConversation() {
        // get checked mates
        this.conversation.members = this.friends.filter((f:any) => f.checked);
        this.chat.createConversation(this.conversation).subscribe(() => {
            // reset checked state
            this.friends.forEach((f:any) => {
                f.checked = false;
            });
            this.viewCtrl.dismiss();
        });
    }

    addMatesModal() {
        this.nav.present(Modal.create(ConversationEditMembersPage, {
            conversation: this.conversation
        }));
    }

    leaveConversation() {

    }
}