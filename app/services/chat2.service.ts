import {Events} from 'ionic-angular';
import {Injectable} from 'angular2/core';
import * as Rx from 'rxjs/Rx';
import {Message} from '../models/message.model';
import {User} from "../models/user.model";

declare var io;

@Injectable()
export class Chat2Service {
    socket:any;
    me:User;
    usersStream:Rx.Observable<User[]> = Rx.Observable<User[]>();
    usersResponseStream:any;
    messagesStream:Rx.Observable<Message[]> = Rx.Observable<Message[]>();
    messagesResponseStream:any;
    messages:Rx.Subject<Message> = new Rx.Subject<Message>(null);
    currentMessages:Rx.Subject<Message[]> = new Rx.Subject<Message[]>(null);
    createMessage:Rx.Subject<Message> = new Rx.Subject<Message>();
    friends:Rx.Subject<User[]> = new Rx.Subject<User[]>(null);
    currentFriend:Rx.Subject<User> = new Rx.BehaviorSubject<User>(null);

    constructor(public e:Events) {
    }

    private initUsersStreams():void {
        this.usersStream = Rx.Observable.fromEvent(this.socket, 'onlineUsers');

        this.usersStream.subscribe((users) => {
            this.usersResponseStream = Rx.Observable.create((observer) => {
                observer.next(users);
            });

            this.usersResponseStream.subscribe((users:User[]) => {
                this.friends.next(users);
            });
        });
    }

    private initMessagesStreams():void {
        this.messagesStream = Rx.Observable.fromEvent(this.socket, 'onMessage');

        this.messagesStream.subscribe((message:Message) => {
            this.messagesResponseStream = Rx.Observable.create((observer) => {
                observer.next(message);
            });

            this.messagesResponseStream.subscribe((message:Message) => {
                this.createMessage.next(message);
            });
        });

        this.createMessage.map((message:Message) => {
            return message;
        }).subscribe((message:Message) => {
            this.e.publish('newMessage', true);
            this.messages.next(message);
        });
    }

    public setCurrentFriend(user:User):void {
        this.currentFriend.next(new User(user));
    }

    public getCurrentMessages(user:User) {
        let msgs:Message[] = [];
        return this.messages.map((message:Message) => {
            if ((message.to._id === user._id &&
                message.from._id === this.me._id) ||
                (message.to._id === this.me._id &&
                message.from._id === user._id)) {
                msgs.push(new Message(message));
            }
            return msgs;
        });
    }

    public sendMessage(msg:Message):Promise {
        return new Promise((resolve, reject) => {
            this.socket.emit('sendMessage', msg, (resp) => {
                if (resp.status) {
                    this.addOwnMessage(msg);
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    private addOwnMessage(msg:Message):void {
        this.createMessage.next(msg);
    }

    private initLoggedInUser():void {
        let profileData = JSON.parse(localStorage.getItem('profile'));
        if (!profileData) {
            return;
        }
        this.me = new User({
            id: profileData._id,
            name: profileData.name,
            avatar: profileData.avatar
        });
    }

    public socketAuth():void {
        let token = localStorage.getItem('id_token');
        this.socket = io.connect('http://localhost:3357');
        this.socket.on('connect', () => {
            this.socket.emit('authenticate', {token: token});
            this.initUsersStreams();
            this.initMessagesStreams();
            this.initLoggedInUser();
        });
    }

}