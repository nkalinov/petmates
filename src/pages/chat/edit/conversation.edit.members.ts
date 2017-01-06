import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { User } from '../../../models/User';
import { MatesService } from '../../../providers/mates.service';
import { Conversation } from '../../../models/Conversation';

@Component({
    templateUrl: 'conversation.edit.members.html'
})

export class ConversationEditMembersPage {
    friends: Array<User> = [];
    conversation: Conversation;

    constructor(public viewCtrl: ViewController,
                navParams: NavParams,
                private mates: MatesService) {
        this.conversation = navParams.get('conversation');

        // get friends not in members
        this.friends = this.mates.mates.accepted
            .map(f => {
                f.friend.checked = false;
                return f.friend;
            })
            .filter(u => !this.conversation.members.find(m => m._id === u._id));
    }

    haveCheckedFriends() {
        return this.friends.filter((f: any) => f.checked).length > 0;
    }

    addMatesToConversation() {
        this.conversation.members = this.conversation.members.concat(
            this.friends.filter((u: any) => u.checked === true)
        );
        this.viewCtrl.dismiss();
    }
}
