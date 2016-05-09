import {Pipe} from 'angular2/core';
import {Friendship} from '../models/friendship.interface';

@Pipe({
    name: 'friendshipStatus'
})
export class FriendshipStatusPipe {
    private defaultStatus:string = 'accepted';

    transform(value:Array<Friendship>, args?:any[]):any {
        let status = this.defaultStatus;
        if (args) {
            status = args[0];
        }

        return value.filter((f) => f.status === status);
    }
}