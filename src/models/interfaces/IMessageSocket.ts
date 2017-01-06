import { IUserPartial } from './IUserPartial';

// todo use Pick <Message> (typescript 2.1)
export interface IMessageSocket {
    author: IUserPartial;
    msg: string;
    added: Date;
}
