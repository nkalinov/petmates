import { schema } from 'normalizr';

export const petEntity = new schema.Entity('pets', {}, { idAttribute: '_id' });
export const partialUserEntity = new schema.Entity('users', {}, { idAttribute: '_id' });

export const userEntity = new schema.Entity('users', {
    pets: [petEntity],
    mates: new schema.Array({
        friend: partialUserEntity
    })
}, { idAttribute: '_id' });
