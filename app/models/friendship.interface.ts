import {User} from './user.model';

export const STATUS_PENDING = 'pending';
export const STATUS_REQUESTED = 'requested';
export const STATUS_ACCEPTED = 'accepted';

export interface Friendship {
    _id:string;
    status:string;
    added:Date;
    friend:User;
}