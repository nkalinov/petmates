import { combineReducers } from '@ngrx/store';
import users from './entities.users.reducers';
import pets from './entities.pets.reducers';
import coordinates from './entities.coordinates.reducers';

export default combineReducers({
    users,
    pets// ,
    // coordinates
});
