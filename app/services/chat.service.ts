import {Events, Config} from 'ionic-angular';
import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {SocketService} from './socket.service';
import {AuthService} from "./auth.service";
import {Message} from '../models/message.model';
import {Observable} from 'rxjs/Observable';
import {User} from "../models/user.model";
import {MatesService} from "./mates.service";
import {Friendship} from "../models/friendship.interface";

@Injectable()
export class ChatService {
    messages = {};

    constructor(private http:Http,
                private sockets:SocketService,
                private events:Events,
                private config:Config,
                private mates:MatesService,
                private auth:AuthService) {
        this.messages = {}; // reload cache on app init
    }

    getMessages(user:User) {
        let headers = new Headers();
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.get(`${this.config.get('API')}/messages/${user._id}`, {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        if (!this.messages[user._id] || this.messages[user._id].length < res.data.length) {
                            this.messages[user._id] = res.data.map((msg) => {
                                let parsed = new Message(msg);
                                if (<string>parsed.from === user._id) {
                                    parsed.from = user;
                                } else {
                                    parsed.from = this.auth.user;
                                }
                                return parsed;
                            });
                        }
                        observer.next(this.messages[user._id]);
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

    send(message:Message) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.auth.token);

        return new Observable((observer) => {
            this.http.post(`${this.config.get('API')}/messages`, JSON.stringify({
                to: message.to._id,
                msg: message.msg
            }), {headers: headers}).subscribe(
                (res:any) => {
                    res = res.json();
                    if (res.success) {
                        message.added = new Date();
                        this.addMessage(message);
                        this.sockets.socket.emit('chat:send', message);
                    } else {
                        this.events.publish('alert:error', res.msg);
                    }
                    observer.next(res);
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

    registerChatEvents(socket) {
        socket.on('chat:receive', (data:any) => {
            let find = this.mates.mates.accepted.find((f:Friendship) => {
                if (data.from._id === f.friend._id) {
                    if (f.newMessages) {
                        f.newMessages += 1;
                    } else {
                        f.newMessages = 1;
                    }
                }
            });
            this.addMessage(new Message(data), 'from'); // from:User
        });
    }

    private addMessage(message:Message, fromto = 'to') {
        if (!this.messages[message[fromto]._id]) {
            this.messages[message[fromto]._id] = [];
        }
        this.messages[message[fromto]._id].unshift(message);
    }
}