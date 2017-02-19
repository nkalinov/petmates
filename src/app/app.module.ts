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
import { PetsPage } from '../pages/pets/pets';
import { PetEditPage } from '../pages/pets/edit/PetEditPage';
import { BreedPage } from '../pages/pets/edit/breed/breed';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileEdit } from '../pages/profile/edit/profile.edit';
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
import { PetService } from '../providers/pet.service';
import { DistancePipe } from '../pipes/distance';
import { StoreModule } from '@ngrx/store';
import { AuthActions } from '../pages/auth/auth.actions';
import { EffectsModule } from '@ngrx/effects';
import { AppActions } from './app.actions';
import { AuthEffects } from '../pages/auth/auth.effects';
import { AppEffects } from './app.effects';
import rootReducer from './rootReducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ApiService } from '../providers/api.service';
import { SocketEffects } from '../effects/socket.effects';
import { SocketActions } from '../actions/socket.actions';
import { ChatEffects } from '../pages/chat/chat.effects';
import { ChatActions } from '../pages/chat/chat.actions';
import { ApiActions } from '../actions/api.actions';
import { ImageUpload } from '../components/image-upload/image-upload';

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

    PetsPage,
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
        StoreModule.provideStore(rootReducer),
        StoreDevtoolsModule.instrumentOnlyWithExtension({
            maxAge: 5
        }),
        EffectsModule.run(AppEffects),
        EffectsModule.run(AuthEffects),
        EffectsModule.run(SocketEffects),
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
        NearbyService,
        LocationService,
        EventsService,
        PlacesService,
        ReportsService,
        PetService,
        BreedService,
        ChatService,
        {
            provide: ErrorHandler,
            useClass: IonicErrorHandler
        },

        // actions
        ApiActions,
        AppActions,
        AuthActions,
        ChatActions,
        SocketActions
    ]
})
export class AppModule {
}
