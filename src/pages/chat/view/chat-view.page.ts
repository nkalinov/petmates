import { NavParams, NavController, Content } from 'ionic-angular';
import { ViewChild, Component, OnDestroy } from '@angular/core';
import { ChatService } from '../../../providers/chat.service';
import { AuthService } from '../../auth/auth.service';
import { Message } from '../../../models/Message';
import { IChat } from '../../../models/interfaces/IChat';
import { ConversationEditPage } from '../edit/conversation.edit';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app/state';
import { ChatActions } from '../chat.actions';
import { Subscription } from 'rxjs/Subscription';
import { Actions } from '@ngrx/effects';
import { IResponseUpload } from '../../../models/interfaces/IResponseUpload';

@Component({
    selector: 'chat-view-page',
    templateUrl: 'chat-view.page.html'
})

export class ChatViewPage implements OnDestroy {
    @ViewChild(Content) content: Content;
    chat: IChat;
    message: Message;
    private subscription: Subscription;
    private subscription2: Subscription;

    constructor(public authService: AuthService,
                public chatService: ChatService,
                private nav: NavController,
                private navParams: NavParams,
                private store: Store<AppState>,
                private actions$: Actions) {
        const chatId = this.navParams.get('chatId');
        this.newMessage();

        this.subscription = this.store.select(state => state.chats)
            .withLatestFrom(this.store.select(state => state.entities.users))
            .map(([chats, users]) => {
                const chat = chats.find(chat => chat._id === chatId);

                return {
                    ...chat,
                    messages: (chat.messages || []).map(msg => ({
                        ...msg,
                        author: users[<string>msg.author]
                    })),
                    members: (chat.members || []).map(member => ({ ...users[<string>member] })),
                    lastMessage: chat.lastMessage ? {
                        ...chat.lastMessage,
                        author: users[<string>chat.lastMessage.author]
                    } : null
                }
            })
            .subscribe(chat => {
                this.chat = <IChat>chat;
            });

        // request messages if all of them currently are via WebSocket
        if (!this.chat.messages.filter(m => !m.fromSocket).length) {
            this.store.dispatch(ChatActions.requestMessages(this.chat._id));
        }

        if (this.chat.newMessages) {
            this.scrollToBottom();
        }

        // scroll to bottom events
        this.subscription2 = this.actions$
            .ofType(ChatActions.MESSAGES_REQ_SUCCESS, ChatActions.SEND_MSG_REQ)
            .subscribe(() => {
                this.scrollToBottom();
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
    }

    editConversation() {
        this.nav.push(ConversationEditPage, {
            conversation: this.chat
        });
    }

    sendMessage() {
        if (this.message.msg.length || this.message.picture) {
            this.message.added = new Date();
            this.store.dispatch(ChatActions.sendMessage(this.message, this.chat._id));
            this.newMessage();
        }
    }

    onUploadSuccess(res: IResponseUpload) {
        this.message.pic = res.data.url;
        this.message.picture = res.data.filename;
        this.message.mimetype = res.data.mimetype;
        this.sendMessage();
    }

    scrollToBottom(duration = 100) {
        // read messages
        this.store.dispatch(ChatActions.readMessages(this.chat._id));

        setTimeout(() => {
            this.content.scrollToBottom(duration);
        });
    }

    private newMessage() {
        this.message = new Message({ author: this.authService.user._id });
    }
}
