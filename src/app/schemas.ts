import { schema } from 'normalizr';

export const petEntity = new schema.Entity('pets', {}, { idAttribute: '_id' });
export const partialUserEntity = new schema.Entity('users', {}, { idAttribute: '_id' });

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

export const chatEntity = new schema.Object({
    lastMessage: {
        author: partialUserEntity
    },
    members: [partialUserEntity]
});
