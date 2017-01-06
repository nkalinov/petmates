import { Events, Config, Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { Message } from '../models/Message';
import { IMessageSocket } from '../models/interfaces/IMessageSocket';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocalNotifications } from 'ionic-native';
import { makeFileRequest } from '../utils/common';

@Injectable()
export class ChatService {
    conversations$ = new BehaviorSubject([]);
    conversations: Array<Conversation> = []; // cache
    mappedConversations: Object = {};

    constructor(private http: Http,
                private sockets: SocketService,
                private events: Events,
                private config: Config,
                private auth: AuthService,
                private platform: Platform) {
    }

    createOrUpdateConversation(c: Conversation) {
        return !c._id ?
            this.createConversation(c) :
            this.updateConversation(c);
    }

    createConversation(c: Conversation) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Promise((resolve, reject) => {
            this.http.post(
                `${this.config.get('API')}/conversations`,
                JSON.stringify({
                    name: c.name,
                    members: c.members.map(f => f._id)
                }),
                { headers: headers }
            ).map(res => res.json()).subscribe(
                res => {
                    if (res.success) {
                        this.conversations.unshift(new Conversation(res.data));
                        this.conversations$.next(this.conversations);
                        resolve(this.conversations[0]);
                    } else {
                        this.events.publish('alert:error', res.msg);
                        reject(res.msg);
                    }
                },
                err => {
                    this.events.publish('alert:error', err.text());
                    reject(err);
                }
            );
        });
    }

    updateConversation(c: Conversation) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', this.auth.token);

            this.http.put(`${this.config.get('API')}/conversations/${c._id}`, JSON.stringify({
                name: c.name,
                members: c.members.map(f => f._id)
            }), { headers: headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            this.mappedConversations[c._id] = Object.assign(this.mappedConversations[c._id], {
                                name: c.name,
                                members: c.members
                            });
                            resolve();
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject();
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }

    leaveConversation(c: Conversation) {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', this.auth.token);

            this.http.delete(`${this.config.get('API')}/conversations/${c._id}`, { headers: headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            let index = this.conversations.findIndex(sc => sc._id === c._id);
                            if (index > -1) {
                                this.conversations.splice(index, 1);
                                delete this.mappedConversations[c._id];
                            }
                            // this.conversations$.next(this.conversations);
                            resolve();
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject(res.msg);
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject(err.text());
                    }
                );
        });
    }

    getConversations() {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/conversations`, { headers: headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            // todo merge name and members
                            this.conversations = res.data.map(data => {
                                const c = new Conversation(data);
                                this.mappedConversations[c._id] = c;
                                return c;
                            });
                            this.conversations$.next(this.conversations);
                            resolve();
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject();
                        }
                    },
                    err => {
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }

    getMessages(conversation: Conversation) {
        // todo cache
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.append('Authorization', this.auth.token);

            this.http.get(`${this.config.get('API')}/conversations/${conversation._id}`, { headers: headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            conversation.messages = res.data.map(msg => new Message(msg));
                            resolve();
                        } else {
                            this.events.publish('alert:error', res.msg);
                            reject(res.msg);
                        }
                    },
                    err => {
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

            // add immediately
            message.added = new Date();
            conversation.messages.push(message);
            conversation.lastMessage = message;

            this.http.post(`${this.config.get('API')}/conversations/${conversation._id}`, JSON.stringify(message), { headers })
                .map(res => res.json())
                .subscribe(
                    res => {
                        if (res.success) {
                            this.sockets.socket.emit('chat:msg:send', <IMessageSocket>{
                                author: message.author.toPartial(),
                                added: message.added,
                                msg: message.msg,
                                pic: message.pic
                            }, conversation._id);
                            resolve();
                        } else {
                            conversation.messages.splice(
                                conversation.messages.indexOf(message),
                                1
                            );
                            this.events.publish('alert:error', 'Message could not be send! Try again.');
                            reject();
                        }
                    },
                    err => {
                        conversation.messages.splice(
                            conversation.messages.indexOf(message),
                            1
                        );
                        this.events.publish('alert:error', err.text());
                        reject();
                    }
                );
        });
    }

    upload(file: any, message: Message) {
        return new Promise((resolve, reject) => {
            const onSuccess = res => {
                if (res.response.success) {
                    message.pic = res.response.data.url;
                    message.picture = res.response.data.filename;
                    message.mimetype = res.response.data.mimetype;
                    resolve();
                } else {
                    this.events.publish('alert:error', res.response.msg);
                    throw res.response.msg;
                }
            };
            const onError = err => {
                this.events.publish('alert:error', err);
                reject();
            };

            if (this.platform.is('cordova')) {
                // mobile
                const options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = { 'Authorization': this.auth.token };
                const ft = new FileTransfer();
                ft.upload(file, `${this.config.get('API')}/upload`,
                    res => onSuccess(JSON.parse(res.response)),
                    onError,
                    options
                );
            } else {
                // web
                makeFileRequest(`${this.config.get('API')}/upload`, file, this.auth.token)
                    .then(onSuccess, onError);
            }
        });
    }

    registerSocketEvents(socket) {
        // update conversations
        socket.on('chat:conversations:update', () => {
            console.info('chat:conversations:update');
            this.getConversations();
        });

        // new message in conversation
        socket.on('chat:msg:new', (message: IMessageSocket, cid: string) => {
            console.info('chat:msg:new', message, cid);

            LocalNotifications.schedule({
                id: 1,
                text: `${message.author.name}: ${message.msg || 'Photo message'}`
            });

            const c = this.mappedConversations[cid];
            if (c) {
                // add to conversation
                message.added = new Date(message.added);
                c.messages.push(message);
                c.lastMessage = message;
                c.newMessages += 1;
            }
        });
    }

    getConversationTitle(c: Conversation) {
        if (c) {
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
        return '';
    }

    getMembersPic(c: Conversation) {
        if (c.members.length === 2) {
            return c.members
                .filter((m: User) => m._id !== this.auth.user._id)[0].pic;
        }
        return 'group';
    }
}
