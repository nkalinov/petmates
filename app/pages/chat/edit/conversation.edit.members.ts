import {Page, NavParams, ViewController} from 'ionic-angular';
import {User} from '../../../models/user.model';
import {MatesService} from '../../../services/mates.service';
import {Conversation} from '../../../models/conversation.model';

@Page({
    templateUrl: 'build/pages/chat/edit/conversation.edit.members.html'
})

export class ConversationEditMembersPage {
    friends:Array<User> = [];
    conversation:Conversation;

    constructor(public viewCtrl:ViewController,
                navParams:NavParams,
                private mates:MatesService) {
        this.conversation = navParams.get('conversation');

        // get friends not in members
        this.friends = mates.mates.accepted
            .map((f) => f.friend)
            .filter((u:User) => !this.conversation.members.find((m:User) => m._id === u._id));
    }

    addMatesToConversation() {
        this.conversation.members = this.conversation.members.concat(this.friends.filter((u:any) => u.checked === true));
        this.viewCtrl.dismiss();
    }
}