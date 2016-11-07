import 'leaflet';
import 'leaflet.markercluster';
import '../vendor/rxjs.operators';
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
import { ForgotForm } from '../pages/auth/forgot/forgot.form';
import { AuthModal } from '../pages/auth/auth';
import { ConversationsListPage } from '../pages/chat/conversations.list';
import { ConversationPage } from '../pages/chat/view/conversation';
import { ConversationEditPage } from '../pages/chat/edit/conversation.edit';
import { ConversationEditMembersPage } from '../pages/chat/edit/conversation.edit.members';
import { HelpPage } from '../pages/help/help';
import { MapPage } from '../pages/map/map';
import { WalkModal } from '../pages/map/walk-modal/walk-modal';
import { NearbyPage } from '../pages/nearby/nearby';
import { MatesPage } from '../pages/mates/mates';
import { MateViewPage } from '../pages/mates/view/mate.view';
import { MatesSearchPage } from '../pages/mates/search/mates.search';
import { MatesAcceptedPage } from '../pages/mates/tabs/accepted/mates.accepted';
import { MatesPendingPage } from '../pages/mates/tabs/pending/mates.pending';
import { MatesRequestedPage } from '../pages/mates/tabs/requested/mates.requested';
import { EventsPage } from '../pages/nearby/events/events';
import { EventEditPage } from '../pages/nearby/events/event-edit';
import { EventViewPage } from '../pages/nearby/events/event-view';
import { PeoplePage } from '../pages/nearby/people/people';
import { PlacesPage } from '../pages/nearby/places/places';
import { PlaceViewPage } from '../pages/nearby/places/place-view';
import { PlaceEditPage } from '../pages/nearby/places/place-edit';
import { ReportPlacePage } from '../pages/nearby/places/report-place/report-place';
import { PetsPage } from '../pages/pets/pets';
import { PetEditPage } from '../pages/pets/edit/pet.edit';
import { BreedPage } from '../pages/pets/edit/breed/breed';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileEdit } from '../pages/profile/edit/profile.edit';
import { MateImage } from '../common/mate-image';
import { PetImage } from '../common/pet-image';
import { AgeInfo } from '../common/age';
import { GenderInfo } from '../common/gender';
import { LastActivity } from '../common/last-activity';
import { PlaceImage } from '../common/place-image';
import { config } from './config';
import { PlaceType } from '../models/place.model';

const pages: Array<any> = [
    PetMatesApp,

    ForgotForm,
    AuthModal,

    ConversationsListPage,
    ConversationPage,
    ConversationEditPage,
    ConversationEditMembersPage,

    HelpPage,

    MapPage,
    WalkModal,

    MatesPage,
    MateViewPage,
    MatesSearchPage,
    MatesAcceptedPage,
    MatesPendingPage,
    MatesRequestedPage,

    NearbyPage,
    EventsPage,
    EventEditPage,
    EventViewPage,
    PeoplePage,
    PlacesPage,
    PlaceViewPage,
    PlaceEditPage,
    ReportPlacePage,

    PetsPage,
    PetEditPage,
    BreedPage,

    ProfilePage,
    ProfileEdit
];

@NgModule({
    declarations: pages.concat([
        MateImage,
        PetImage,
        AgeInfo,
        GenderInfo,
        LastActivity,
        PlaceImage
    ]),
    imports: [
        IonicModule.forRoot(PetMatesApp, Object.assign(config, {
            tabsPlacement: 'bottom',
            emitCoordsIntervalMs: 15 * 1000,
            deleteInactiveIntervalMs: 30 * 1000,
            defaultImages: {
                pet: 'assets/img/default_pet.jpg',
                mate: 'assets/img/default_user.gif',

                [PlaceType.Vet]: 'assets/img/hospital_marker.png',
                [`${PlaceType.Vet}View`]: 'assets/img/hospital_marker.png', // todo

                [PlaceType.Shop]: 'assets/img/hospital_marker.png', // todo
                [`${PlaceType.Shop}View`]: 'assets/img/hospital_marker.png' // todo
            }
        }))
    ],
    bootstrap: [IonicApp],
    entryComponents: pages,
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
