import { IUserPartial } from './IUserPartial';
import { IWalkPet } from './IWalkPet';

export interface IWalkPartial {
    id: string;
    user: IUserPartial;
    coords: L.LatLngExpression;
    pet: IWalkPet;
}
