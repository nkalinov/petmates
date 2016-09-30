import { Injectable } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { Http } from '@angular/http';
import { Events } from 'ionic-angular';
import { AuthService } from './auth.service';

@Injectable()
export class LocationService {
    lastCoords: Array<Number>;

    constructor(private http: Http,
                private auth: AuthService,
                private events: Events) {
    }

    getLastCoords() {
        return this.lastCoords ? this.lastCoords : this.auth.user.location.coordinates;
    }

    getGeolocation(opts?: any): Promise<Array<Number>> {
        return Geolocation.getCurrentPosition(Object.assign({}, opts, {
            enableHighAccuracy: true
        })).then(
            data => {
                this.lastCoords = [data.coords.longitude, data.coords.latitude];
                return this.lastCoords;
            },
            err => {
                this.events.publish('alert:error', err.text());
                return this.auth.user.location.coordinates; // fallback to cached
            });
    }

    getLocation(): Promise<{
        city?: string;
        country?: string;
        coordinates?: Array<Number>;
    }> {
        return new Promise((resolve, reject) => {
            this.getGeolocation().then(data => {
                const location: any = {
                    coordinates: data
                };
                this.http
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data[1]},${data[0]}&key=AIzaSyCInsRcxf6Y6zI7xkYA5VWDjEH9asjPP3g`)
                    .map(res => res.json())
                    .subscribe(res => {
                        res.results[0]['address_components'].map((item) => {
                            if (item.types[0] === 'administrative_area_level_1') {
                                location.city = item.long_name;
                            }
                            if (item.types[0] === 'country') {
                                location.country = item.long_name;
                            }
                        });
                    }, err => {
                        // LIMIT probably reached todo something
                    }, () => resolve(location));
            });
        });
    }
}