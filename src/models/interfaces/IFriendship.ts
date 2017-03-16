import { User } from '../User';

export const STATUS_PENDING = 'pending';
export const STATUS_REQUESTED = 'requested';
export const STATUS_ACCEPTED = 'accepted';

export interface IFriendship {
    status: string;
    added: Date;
    friend: User;

    newMessages?: number; // contain new msgs count for badge
}
