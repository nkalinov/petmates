import auth from '../pages/auth/auth.reducers';
import entities from '../reducers/entities';
import lastActivities from '../reducers/lastActivities.reducers';
import { matesSearchResults } from '../pages/mates/mates.reducers';
import chats from '../pages/chat/chat.reducers';
import { compose } from '@ngrx/core/compose';
import { combineReducers } from '@ngrx/store';
import { config } from './config';

const metaReducers = config.DEV
    ? [combineReducers]
    : [combineReducers];

export default compose(...metaReducers)({
    auth,
    entities,
    matesSearchResults,
    lastActivities,
    chats
});
