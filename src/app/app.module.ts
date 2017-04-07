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
import { MatesService } from '../pages/mates//mates.service';
import { ChatService } from '../providers/chat.service';
import { NearbyService } from '../providers/nearby.service';
import { LocationService } from '../providers/location.service';
import { ForgotForm } from '../pages/auth/forgot/forgot.form';
import { AuthPage } from '../pages/auth/auth.page';
import { ChatsListPage } from '../pages/chat/chats-list.page';
import { ChatViewPage } from '../pages/chat/view/chat-view.page';
import { ConversationEditPage } from '../pages/chat/edit/conversation.edit';
import { ConversationEditMembersPage } from '../pages/chat/edit/conversation.edit.members';
import { HelpPage } from '../pages/help/help';
import { MapPage } from '../pages/map/MapPage';
import { StartWalkPage } from '../pages/map/start-walk/StartWalkPage';
import { NearbyPage } from '../pages/nearby/nearby';
import { MatesPage } from '../pages/mates/mates.page';
import { MateViewPage } from '../pages/mates/view/mate-view.page';
import { MatesSearchPage } from '../pages/mates/search/mates-search.page';
import { MatesAcceptedPage } from '../pages/mates/tabs/accepted/mates-accepted.page';
import { MatesPendingPage } from '../pages/mates/tabs/pending/mates-pending.page';
import { MatesRequestedPage } from '../pages/mates/tabs/requested/mates-requested.page';
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
import store from './store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ApiService } from '../providers/api.service';
import { SocketEffects } from '../effects/socket.effects';
import { ChatEffects } from '../pages/chat/chat.effects';
import { ImageUpload } from '../components/image-upload/image-upload';
import { PetsEffects } from '../pages/pets/pets.effects';
import { IonicStorageModule } from '@ionic/storage';
import { MatesEffects } from '../pages/mates/mates.effects';
import { Facebook } from '@ionic-native/facebook';
import { ImagePicker } from '@ionic-native/image-picker';
import { Geolocation } from '@ionic-native/geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

const pages: Array<any> = [
    PetMatesApp,

    ForgotForm,
    AuthPage,

    ChatsListPage,
    ChatViewPage,
    ConversationEditPage,
    ConversationEditMembersPage,

    HelpPage,

    // MapPage,
    // StartWalkPage,

    MatesPage,
    MateViewPage,
    MatesSearchPage,
    MatesAcceptedPage,
    MatesPendingPage,
    MatesRequestedPage,

    // NearbyPage,
    // NearbyPeoplePage,
    // NearbyPetsPage,
    // NearbyEventsPage,
    // EventEditPage,
    // EventViewPage,
    // NearybyPlacesPage,
    // PlaceEditPage,
    ReportModalPage,

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
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(
            PetMatesApp,
            Object.assign(config, {
                tabsPlacement: 'bottom'
            })
        ),
        IonicStorageModule.forRoot(),
        StoreModule.provideStore(store),
        StoreDevtoolsModule.instrumentOnlyWithExtension({
            maxAge: 5
        }),
        EffectsModule.run(AppEffects),
        EffectsModule.run(AuthEffects),
        EffectsModule.run(SocketEffects),
        EffectsModule.run(PetsEffects),
        EffectsModule.run(MatesEffects),
        EffectsModule.run(ChatEffects),
        IonicImageViewerModule
    ],
    bootstrap: [IonicApp],
    entryComponents: pages,
    providers: [
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
        },

        // plugins
        Facebook,
        ImagePicker,
        Geolocation,
        LocalNotifications
    ]
})
export class AppModule {
}
