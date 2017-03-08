import { schema } from 'normalizr';

export const petEntity = new schema.Entity('pets', {}, { idAttribute: '_id' });

export const userEntity = new schema.Entity('users', {
    pets: [petEntity]
}, { idAttribute: '_id' });
