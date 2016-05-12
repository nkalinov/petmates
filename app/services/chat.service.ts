import {Events, Config} from 'ionic-angular';
import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {SocketService} from './socket.service';
import {AuthService} from './auth.service';
import {Message} from '../models/message.model';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user.model';
import {Conversation} from '../models/conversation.model';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class ChatService {
    conversations$ = new BehaviorSubject([]);
    private conversations:Array<Conversation> = [];

    constructor(private http:Http,
                private sockets:SocketService,
                private events:Events,
                private config:Config,
                private auth:AuthService) {
    }

    createConversation(conversation:Conversation) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/conversations`, JSON.stringify({
                members: conversation.members.map((f) => f._id)
            }), {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        let newConversation = new Conversation(res.data);
                        newConversation.members = conversation.members;
                        this.conversations.unshift(newConversation);
                        observer.next(this.conversations[0]);
                    } else {
                        observer.error(res.msg);
                        this.events.publish('alert:error', res.msg);
                    }
                    observer.complete();
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err);
                    observer.complete();
                }
            );
        });
    }

    getConversations() {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);
        this.http.get(`${this.config.get('API')}/conversations`, {headers: headers}).subscribe(
            (res:any) => {
                res = res.json();
                if (res.success) {
                    this.conversations = res.data.map((data) => new Conversation(data));
                    this.conversations$.next(this.conversations);
                } else {
                    this.events.publish('alert:error', res.msg);
                }
            },
            (err) => {
                this.events.publish('alert:error', err.text());
            }
        );
    }

    getMessages(conversation:Conversation) {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.get(`${this.config.get('API')}/conversations/${conversation._id}`, {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        conversation.messages = res.data.map((msg) => {
                            let parsed = new Message(msg);
                            if (<string>parsed.author === this.auth.user._id) {
                                parsed.author = this.auth.user;
                            } else {
                                // find in conversation.members
                                let findAuthor = conversation.members.find((m) => m._id === parsed.author);
                                if (findAuthor) {
                                    parsed.author = findAuthor;
                                } else {
                                    // todo member leaved the group ?
                                }
                            }
                            return parsed;
                        });
                        observer.next(conversation.messages);
                    } else {
                        observer.error(res.msg);
                        this.events.publish('alert:error', res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err);
                },
                () => observer.complete()
            );
        });
    }

    send(message:Message, conversation:Conversation) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/conversations/${conversation._id}`, JSON.stringify({
                msg: message.msg
            }), {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        message.added = new Date();
                        conversation.messages.push(message);
                        conversation.lastMessage = message;
                        this.sockets.socket.emit('chat:send', message, conversation);
                        observer.next(res);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        observer.error(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err);
                },
                () => observer.complete()
            );
        });
    }

    registerChatEvents(socket) {
        // update conversations members last activity
        socket.on('users', (data) => {
            if (data && data !== {}) {
                this.conversations.forEach((c:Conversation) => {
                    c.members.forEach((m:User) => {
                        if (data[m._id]) {
                            // if online
                            m.lastActive = new Date(data[m._id]);
                        }
                    });
                });
            }
        });

        // update conversations
        socket.on('chat:conversation', () => {
            this.getConversations();
        });

        // new message in conversation
        socket.on('chat:receive', (message:Message, cid:string) => {
            let find:Conversation = this.conversations.find((c) => c._id === cid);
            if (find) {
                // add to conversation
                find.messages.push(message);
                message.added = new Date(<any>message.added);
                find.lastMessage = message;

                // increment badge
                if (find.newMessages) {
                    find.newMessages += 1;
                } else {
                    find.newMessages = 1;
                }
            }
        });
    }

    getMembersNames(c:Conversation) {
        if (c.members.length === 2) {
            return c.members
                .filter((m:User) => m._id !== this.auth.user._id)[0].name;
        }
        if (c.name) {
            return c.name;
        }
        return c.members
            .filter((m:User) => m._id !== this.auth.user._id)
            .map((m:User) => m.name)
            .join(', ');
    }

    getMembersPic(c:Conversation) {
        if (c.members.length === 2) {
            return c.members
                .filter((m:User) => m._id !== this.auth.user._id)[0].pic;
        }
        return 'group';
    }

    getMembersLastActivity(c:Conversation) {
        if (c.members.length === 2) {
            return c.members
                .filter((m:User) => m._id !== this.auth.user._id)[0].lastActive;
        }
        return null;
    }
}