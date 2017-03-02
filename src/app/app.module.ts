import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster.layersupport';
import '../rxjs.operators';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PetMatesApp } from './app.component';
import { EventsService } from '../providers/events.service';
import { AuthService } from '../pages/auth/auth.service';
import { SocketService } from '../providers/socket.service';
import { BreedService } from '../providers/breed.service';
import { WalkService } from '../providers/walk.service';
import { MatesService } from '../providers/mates.service';
import { ChatService } from '../providers/chat.service';
import { NearbyService } from '../providers/nearby.service';
import { LocationService } from '../providers/location.service';
import { ForgotForm } from '../pages/auth/forgot/forgot.form';
import { AuthPage } from '../pages/auth/auth.page';
import { ConversationsListPage } from '../pages/chat/chats-list.page';
import { ConversationPage } from '../pages/chat/view/conversation';
import { ConversationEditPage } from '../pages/chat/edit/conversation.edit';
import { ConversationEditMembersPage } from '../pages/chat/edit/conversation.edit.members';
import { HelpPage } from '../pages/help/help';
import { MapPage } from '../pages/map/MapPage';
import { StartWalkPage } from '../pages/map/start-walk/StartWalkPage';
import { NearbyPage } from '../pages/nearby/nearby';
import { MatesPage } from '../pages/mates/mates';
import { MateViewPage } from '../pages/mates/view/MateViewPage';
import { MatesSearchPage } from '../pages/mates/search/mates.search';
import { MatesAcceptedPage } from '../pages/mates/tabs/accepted/mates.accepted';
import { MatesPendingPage } from '../pages/mates/tabs/pending/mates.pending';
import { MatesRequestedPage } from '../pages/mates/tabs/requested/mates.requested';
import { NearbyEventsPage } from '../pages/nearby/events/events';
import { EventEditPage } from '../pages/nearby/events/event-edit';
import { EventViewPage } from '../pages/nearby/events/event-view';
import { NearbyPeoplePage } from '../pages/nearby/people/people';
import { NearbyPetsPage } from '../pages/nearby/pets/NearbyPetsPage';
import { NearybyPlacesPage } from '../pages/nearby/places/places';
import { PlaceEditPage } from '../pages/nearby/places/place-edit';
import { ReportModalPage } from '../components/report-modal/report-modal';
import { PetsListPage } from '../pages/pets/list/pets-list.page';
import { PetEditPage } from '../pages/pets/edit/pet-edit.page';
import { BreedPage } from '../pages/pets/edit/breed/breed';
import { ProfilePage } from '../pages/profile/profile.page';
import { ProfileEdit } from '../pages/profile/edit/profile-edit.page';
import { MateImage } from '../components/mate-image/mate-image';
import { PetImage } from '../components/pet-image/pet-image';
import { AgeInfo } from '../components/age';
import { GenderInfo } from '../components/gender';
import { LastActivity } from '../components/last-activity';
import { PlaceIcon } from '../components/place-icon/place-icon';
import { config } from './config';
import { TimeAgo } from '../components/timeago';
import { PlacesService } from '../providers/places.service';
import { ReportsService } from '../providers/reports.service';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { PetsService } from '../pages/pets/pets.service';
import { DistancePipe } from '../pipes/distance';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from '../pages/auth/auth.effects';
import { AppEffects } from './app.effects';
import reducers from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ApiService } from '../providers/api.service';
import { SocketEffects } from '../effects/socket.effects';
import { ChatEffects } from '../pages/chat/chat.effects';
import { ImageUpload } from '../components/image-upload/image-upload';
import { PetsEffects } from '../pages/pets/pets.effects';

const pages: Array<any> = [
    PetMatesApp,

    ForgotForm,
    AuthPage,

    // ConversationsListPage,
    // ConversationPage,
    // ConversationEditPage,
    // ConversationEditMembersPage,
    //
    HelpPage,
    //
    // MapPage,
    // StartWalkPage,

    // MatesPage,
    // MateViewPage,
    // MatesSearchPage,
    // MatesAcceptedPage,
    // MatesPendingPage,
    // MatesRequestedPage,

    // NearbyPage,
    // NearbyPeoplePage,
    // NearbyPetsPage,
    // NearbyEventsPage,
    // EventEditPage,
    // EventViewPage,
    // NearybyPlacesPage,
    // PlaceEditPage,
    // ReportModalPage,

    PetsListPage,
    PetEditPage,
    BreedPage,

    ProfilePage,
    ProfileEdit
];

@NgModule({
    declarations: [
        ...pages,
        MateImage,
        PetImage,
        AgeInfo,
        GenderInfo,
        LastActivity,
        PlaceIcon,
        TimeAgo,
        DistancePipe,
        ImageUpload
    ],
    imports: [
        IonicModule.forRoot(
            PetMatesApp,
            Object.assign(config, {
                tabsPlacement: 'bottom'
            })
        ),
        StoreModule.provideStore(reducers),
        StoreDevtoolsModule.instrumentOnlyWithExtension({
            maxAge: 8
        }),
        EffectsModule.run(AppEffects),
        EffectsModule.run(AuthEffects),
        EffectsModule.run(SocketEffects),
        EffectsModule.run(PetsEffects),
        EffectsModule.run(ChatEffects),
        IonicImageViewerModule
    ],
    bootstrap: [IonicApp],
    entryComponents: pages,
    providers: [
        Storage,
        ApiService,
        AuthService,
        SocketService,
        WalkService,
        MatesService,
        LocationService,
        NearbyService,
        EventsService,
        PlacesService,
        ReportsService,
        PetsService,
        BreedService,
        ChatService,
        {
            provide: ErrorHandler,
            useClass: IonicErrorHandler
        }
    ]
})
export class AppModule {
}
