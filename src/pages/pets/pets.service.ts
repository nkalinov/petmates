import { forwardRef, Inject, Injectable } from '@angular/core';
import { Pet } from '../../models/Pet';
import { NearbyPet } from '../../models/NearbyPet';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from '../../providers/location.service';
import { ApiService } from '../../providers/api.service';

@Injectable()
export class PetsService {
    nearby$: BehaviorSubject<NearbyPet[]> = new BehaviorSubject([]);

    constructor(@Inject(forwardRef(() => ApiService)) private http: ApiService,
                private location: LocationService) {
    }

    create(pet: Pet) {
        return this.http.post('/pets', pet);
    }

    update(pet: Pet) {
        return this.http.put(`/pets/${pet._id}`, pet);
    }

    remove(id: string) {
        return this.http.delete(`/pets/${id}`);
    }

    getLocationThenNearbyPets(force = false) {
        if (force || !this.nearby$.getValue().length) {
            return this.location.getGeolocation().then(coords => this.getNearbyPets(coords, force));
        } else {
            return Promise.resolve();
        }
    }

    getNearbyPets(coords, force = false) {
        return new Promise((resolve, reject) => {
            if (force || !this.nearby$.getValue().length) {
                this.http
                    .get(`/nearby/pets?coords=${coords}`)
                    .subscribe(
                        res => {
                            this.nearby$.next(
                                res.data.map(u => new NearbyPet(u))
                            );
                            resolve();
                        },
                        err => {
                            // this.events.publish('alert:error', err.text());
                            reject();
                        }
                    );
            } else {
                resolve();
            }
        });
    }
}
