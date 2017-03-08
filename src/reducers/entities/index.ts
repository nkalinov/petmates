import { combineReducers } from '@ngrx/store';
import users from './entities.users.reducers';
import pets from './entities.pets.reducers';

export default combineReducers({
    users,
    pets
});
