import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';
import { deg2rad } from '../utils/common';

@Pipe({
    name: 'distance'
})

export class DistancePipe implements PipeTransform {
    constructor(private authService: AuthService) {
    }

    // transform(value: number): string {
    //     return value < 1000
    //         ? `${value.toFixed().toString()} m`
    //         : `${(value / 1000).toFixed(1).toString()} km`;
    // }

    transform(value: number[]) {
        if (value) {
            const lat1 = value[1];
            const lon1 = value[0];
            const lat2 = this.authService.user.location.coordinates[1];
            const lon2 = this.authService.user.location.coordinates[0];

            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);  // deg2rad below
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
                distance = (R * c) * 1000;

            return distance < 1000
                ? `${distance.toFixed().toString()}m`
                : `${(distance / 1000).toFixed(1).toString()}km`;
        }
        return '';
    }
}
