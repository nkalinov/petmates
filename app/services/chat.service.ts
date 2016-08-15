import { Events, Config } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { Message } from '../models/message.model';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user.model';
import { Conversation } from '../models/conversation.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocalNotifications } from 'ionic-native';

@Injectable()
export class ChatService {
    conversations$ = new BehaviorSubject([]);
    conversations: Array<Conversation> = [];

    constructor(private http: Http,
                private sockets: SocketService,
                private events: Events,
                private config: Config,
                private auth: AuthService) {
    }

    createConversation(c: Conversation) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/conversations`, JSON.stringify({
                name: c.name,
                members: c.members.map((f) => f._id)
            }), { headers: headers }).subscribe(
                (res: any) => {
                    res = res.json();
                    if (res.success) {
                        let newConversation = new Conversation(res.data);
                        newConversation.members = c.members.concat(this.auth.user);
                        this.conversations.unshift(newConversation);
                        this.conversations$.next(this.conversations);
                        observer.next(this.conversations[0]);
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

    /**
     * Update existing conversation
     * @param c - deep copy of the conversation
     * @returns {Observable}
     */
    updateConversation(c: Conversation) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.put(`${this.config.get('API')}/conversations/${c._id}`, JSON.stringify({
                name: c.name,
                members: c.members.map((f) => f._id)
            }), { headers: headers }).subscribe(
                (res: any) => {
                    res = res.json();
                    if (res.success) {
                        let index = this.conversations.findIndex((sc) => sc._id === c._id);
                        if (index > -1) {
                            // get messages and replace
                            c.messages = this.conversations[index].messages;
                            this.conversations[index] = c;
                        }
                        this.conversations$.next(this.conversations);
                        observer.next(this.conversations[index]);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        observer.error(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    observer.error(err.text());
                },
                () => observer.complete()
            );
        });
    }

    leaveConversation(c: Conversation) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/conversations/${c._id}`, { headers: headers }).subscribe(
                (res: any) => {
                    res = res.json();
                    if (res.success) {
                        let index = this.conversations.findIndex((sc) => sc._id === c._id);
                        if (index > -1) {
                            this.conversations.splice(index, 1);
                        }
                        this.conversations$.next(this.conversations);
                        resolve();
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    getConversations() {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);
        this.http.get(`${this.config.get('API')}/conversations`, { headers: headers }).subscribe(
            (res: any) => {
                res = res.json();
                if (res.success) {
                    let newConversations = res.data.map((data) => new Conversation(data));
                    if (this.conversations) {
                        // get messages from saved conversations
                        this.conversations.forEach((c) => {
                            if (c.messages.length > 0) {
                                let find = newConversations.find((nc: Conversation) => nc._id === c._id);
                                if (find) {
                                    find.messages = c.messages;
                                }
                            }
                        });
                    }
                    this.conversations = newConversations;
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

    getMessages(conversation: Conversation) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(
                `${this.config.get('API')}/conversations/${conversation._id}`,
                { headers: headers }
            ).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        conversation.messages = (<any>res.data).map((msg) => {
                            let parsed = new Message(msg);
                            if (<string>parsed.author === this.auth.user._id) {
                                parsed.author = this.auth.user;
                            } else {
                                // find in conversation.members
                                let findAuthor = conversation.members.find((m) => m._id === parsed.author);
                                if (findAuthor) {
                                    parsed.author = findAuthor;
                                } else {
                                    // what todo with messages from members leaved the group ?
                                    parsed.author = new User({
                                        _id: parsed.author,
                                        name: ''
                                    });
                                }
                            }
                            return parsed;
                        });
                        resolve(conversation.messages);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    send(message: Message, conversation: Conversation) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', this.auth.token);

            this.http.post(`${this.config.get('API')}/conversations/${conversation._id}`, JSON.stringify({
                msg: message.msg
            }), { headers: headers }).map(res => res.json()).subscribe(
                (res: any) => {
                    if (res.success) {
                        message.added = new Date();
                        conversation.messages.push(message);
                        conversation.lastMessage = message;
                        this.sockets.socket.emit('chat:send', message, conversation);
                        resolve(res);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                (err) => {
                    this.events.publish('alert:error', err.text());
                    reject(err.text());
                }
            );
        });
    }

    registerSocketEvents(socket) {
        // update conversations members last activity
        socket.on('users', (data) => {
            console.info('users', data);
            if (data && data !== {}) {
                this.conversations.forEach((c: Conversation) => {
                    // todo make this more "global" information
                    c.members.forEach((m: User) => {
                        if (data[m._id]) {
                            // if online
                            m.lastActive = new Date(data[m._id]);
                        }
                    });
                });
                this.conversations$.next(this.conversations);
            }
        });

        // update conversations
        socket.on('chat:conversation', () => {
            this.getConversations();
        });

        // new message in conversation
        socket.on('chat:receive', (message: Message, cid: string) => {
            LocalNotifications.schedule({
                id: 1,
                text: `${message.author.name}: ${message.msg}`
            });

            let c: Conversation = this.conversations.find((c) => c._id === cid);
            if (c) {
                // add to conversation
                c.messages.push(message);
                message.added = new Date(<any>message.added);
                c.lastMessage = message;
                c.newMessages += 1;
            }
        });
    }

    getConversationTitle(c: Conversation) {
        if (c.name) {
            return c.name;
        }
        if (c.members.length === 2) {
            return c.members
                .filter((m: User) => m._id !== this.auth.user._id)[0].name;
        }
        return c.members
            .filter((m: User) => m._id !== this.auth.user._id)
            .map((m: User) => m.name)
            .join(', ');
    }

    getMembersPic(c: Conversation) {
        if (c.members.length === 2) {
            return c.members
                .filter((m: User) => m._id !== this.auth.user._id)[0].pic;
        }
        return 'group';
    }
}
