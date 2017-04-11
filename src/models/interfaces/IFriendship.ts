import { User } from '../User';

export const STATUS_PENDING = 'pending';
export const STATUS_REQUESTED = 'requested';
export const STATUS_ACCEPTED = 'accepted';

export interface IFriendship {
    _id: string;
    status: string;
    friend: string | User;
}
