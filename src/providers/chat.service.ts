import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Message } from '../models/Message';
import { IMessageSocket } from '../models/interfaces/IMessageSocket';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ApiService } from './api.service';
import { AuthService } from '../pages/auth/auth.service';
import { MateImage } from '../components/mate-image/mate-image';

@Injectable()
export class ChatService {
    conversations$ = new BehaviorSubject([]);
    conversations: Array<Conversation> = []; // cache
    mappedConversations: Object = {};

    constructor(private http: ApiService,
                private sockets: SocketService,
                private events: Events,
                private authService: AuthService,
                private localNotifications: LocalNotifications) {
    }

    createOrUpdateConversation(c: Conversation) {
        return !c._id ?
            this.createConversation(c) :
            this.updateConversation(c);
    }

    createConversation(c: Conversation) {
        return new Promise((resolve, reject) => {
            this.http.post(`/conversations`, {
                name: c.name
                // ,
                // members: c.members.map(f => f._id)
            }).subscribe(
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
            // this.http.put(`/conversations/${c._id}`, {
            //     name: c.name,
            //     members: c.members.map(f => f._id)
            // })
            //     .subscribe(
            //         res => {
            //             if (res.success) {
            //                 this.mappedConversations[c._id] = Object.assign(this.mappedConversations[c._id], {
            //                     name: c.name,
            //                     members: c.members
            //                 });
            //                 resolve();
            //             } else {
            //                 this.events.publish('alert:error', res.msg);
            //                 reject();
            //             }
            //         },
            //         err => {
            //             this.events.publish('alert:error', err.text());
            //             reject();
            //         }
            //     );
        });
    }

    leaveConversation(c: Conversation) {
        return new Promise((resolve, reject) => {
            // this.http.delete(`/conversations/${c._id}`)
            //     .subscribe(
            //         res => {
            //             if (res.success) {
            //                 let index = this.conversations.findIndex(sc => sc._id === c._id);
            //                 if (index > -1) {
            //                     this.conversations.splice(index, 1);
            //                     delete this.mappedConversations[c._id];
            //                 }
            //                 // this.conversations$.next(this.conversations);
            //                 resolve();
            //             } else {
            //                 this.events.publish('alert:error', res.msg);
            //                 reject(res.msg);
            //             }
            //         },
            //         err => {
            //             this.events.publish('alert:error', err.text());
            //             reject(err.text());
            //         }
            //     );
        });
    }

    getList() {
        return this.http.get('/conversations');
    }

    getMessages(chatId: string) {
        return this.http.get(`/conversations/${chatId}`);
    }

    send(message: Message, chatId: string) {
        // add immediately
        // message.added = new Date();
        // conversation.messages.push(message);
        // conversation.lastMessage = message;

        return this.http.post(`/conversations/${chatId}`, message);
        // .subscribe(
        //     res => {
        //         if (res.success) {
        //             // this.sockets.socket.emit('chat:msg:send', <IMessageSocket>{
        //             //     author: message.author.toPartial(),
        //             //     added: message.added,
        //             //     msg: message.msg,
        //             //     pic: message.pic
        //             // }, conversation._id);
        //             resolve();
        //         } else {
        //             conversation.messages.splice(
        //                 conversation.messages.indexOf(message),
        //                 1
        //             );
        //             this.events.publish('alert:error', 'Message could not be send! Try again.');
        //             reject();
        //         }
        //     },
        //     err => {
        //         conversation.messages.splice(
        //             conversation.messages.indexOf(message),
        //             1
        //         );
        //         this.events.publish('alert:error', err.text());
        //         reject();
        //     }
        // );
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
            // this.http.upload(file, onSuccess, onError);
        });
    }

    registerSocketEvents(socket) {
        // update conversations
        socket.on('chat:conversations:update', () => {
            console.info('chat:conversations:update');
            // this.getConversations();
        });

        // new message in conversation
        socket.on('chat:msg:new', (message: IMessageSocket, cid: string) => {
            console.info('chat:msg:new', message, cid);

            this.localNotifications.schedule({
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
                // return other's name
                return (
                    <User>c.members.filter((m: User) => m._id !== this.authService.user._id)[0]
                ).name;
            }
            // return all names concat-ed
            return c.members
                .filter((m: User) => m._id !== this.authService.user._id)
                .map((m: User) => m.name).join(', ');
        }
        return '';
    }

    getMembersPic(c: Conversation) {
        if (c.members.length === 2) {
            return (
                <User>c.members.filter((m: User) => m._id !== this.authService.user._id)[0]
            ).pic;
        }
        return MateImage.GROUP;
    }
}
