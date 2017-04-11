import { schema } from 'normalizr';

export const petEntity = new schema.Entity('pets', {}, { idAttribute: '_id' });
const partialUserEntity = new schema.Entity('users', {}, { idAttribute: '_id' });

export const userEntity = new schema.Entity('users', {
    pets: [petEntity],
    mates: new schema.Array({
        friend: partialUserEntity
    })
    // ,
    // location: new schema.Entity('coordinates', {}, {
    //     idAttribute: (value, parent, key) => {
    //         return parent._id
    //     },
    //     processStrategy: (value, parent, key) => {
    //         return value.coordinates
    //     }
    // })
}, { idAttribute: '_id' });

export const messageObject = new schema.Object({
    author: partialUserEntity
});

export const chatObject = new schema.Object({
    lastMessage: messageObject,
    members: [partialUserEntity]
});
