import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { PetMatesApp } from './app.component';

import { EventsService } from '../providers/events.service';
import { AuthService } from '../providers/auth.service';
import { SocketService } from '../providers/socket.service';
import { BreedService } from '../providers/breed.service';
import { WalkService } from '../providers/walk.service';
import { MatesService } from '../providers/mates.service';
import { ChatService } from '../providers/chat.service';
import { NearbyService } from '../providers/nearby.service';
import { LocationService } from '../providers/location.service';

@NgModule({
    declarations: [
        PetMatesApp,
        // HomePage
    ],
    imports: [
        IonicModule.forRoot(PetMatesApp, {
            tabsPlacement: 'bottom',
            // prodMode: true,
            // API: 'http://79.124.64.127:3001',
            // API: 'http://192.168.0.104:3001',
            API: 'http://127.0.0.1:3001',
            emitCoordsIntervalMs: 15 * 1000,
            deleteInactiveIntervalMs: 30 * 1000,
            defaultPetImage: 'build/img/default_pet.jpg',
            defaultMateImage: 'build/img/default_user.gif',
            defaultVetImage: 'build/img/hospital_marker.png',
            defaultVetCardImage: 'build/img/hospital_marker.png', // todo
            defaultShopImage: 'build/img/hospital_marker.png', // todo
            defaultShopCardImage: 'build/img/hospital_marker.png' // todo
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        PetMatesApp
    ],
    providers: [
        Storage,
        AuthService,
        SocketService,
        BreedService,
        WalkService,
        MatesService,
        ChatService,
        NearbyService,
        LocationService,
        EventsService
    ]
})
export class AppModule {
}
