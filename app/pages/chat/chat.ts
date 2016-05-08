import {Page, NavParams, ViewController} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {ChatService} from '../../services/chat.service';
import {User} from '../../models/user.model';
import {AuthService} from '../../services/auth.service';
import {MateImage} from '../../common/mate-image';
import {Message} from '../../models/message.model';

@Page({
    templateUrl: 'build/pages/chat/chat.html',
    directives: [forwardRef(() => MateImage)]
})

export class ChatPage {
    mate:User;
    message:Message = new Message({
        from: this.auth.user
    });
    msgs:Array<Message> = [];

    constructor(public viewCtrl:ViewController,
                public auth:AuthService,
                private chat:ChatService,
                navParams:NavParams) {
        this.mate = navParams.get('mate');
        this.message.to = this.mate;

        this.chat.getMessages(this.mate).subscribe((res) => {
            this.msgs = this.chat.messages[this.mate._id];
        });
    }

    sendMessage() {
        this.chat.send(this.message).subscribe((res) => {
            this.message.msg = '';
        });
    }
}