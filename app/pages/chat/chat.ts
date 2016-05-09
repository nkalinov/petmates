import {Page, NavParams, ViewController} from 'ionic-angular';
import {forwardRef} from 'angular2/core';
import {ChatService} from '../../services/chat.service';
import {AuthService} from '../../services/auth.service';
import {MateImage} from '../../common/mate-image';
import {Message} from '../../models/message.model';
import {Friendship} from "../../models/friendship.interface";
import {MessageTimePipe} from "../../pipes/message.time.pipe";

@Page({
    templateUrl: 'build/pages/chat/chat.html',
    directives: [forwardRef(() => MateImage)],
    pipes: [MessageTimePipe]
})

export class ChatPage {
    mate:Friendship;
    message:Message;
    msgs:Array<Message> = [];

    constructor(public viewCtrl:ViewController,
                public auth:AuthService,
                private chat:ChatService,
                navParams:NavParams) {
        this.mate = navParams.get('mate');
        this.mate.newMessages = 0; // read messages
        this.newMessage();

        this.chat.getMessages(this.mate.friend).subscribe((res) => {
            this.msgs = res;
        });
    }

    onPageWillUnload() {
        this.mate.newMessages = 0; // messages are read now
    }

    sendMessage() {
        this.chat.send(this.message).subscribe((res) => {
            if (res.success) {
                this.newMessage();
            }
        });
    }

    private newMessage() {
        this.message = new Message({
            from: this.auth.user,
            to: this.mate.friend
        })
    }
}