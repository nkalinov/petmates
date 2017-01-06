import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster.layersupport';
import '../rxjs.operators';
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
import { ReportModalPage } from '../common/report-modal/report-modal';
import { PetsPage } from '../pages/pets/pets';
import { PetEditPage } from '../pages/pets/edit/PetEditPage';
import { BreedPage } from '../pages/pets/edit/breed/breed';
import { ProfilePage } from '../pages/profile/profile';
import { ProfileEdit } from '../pages/profile/edit/profile.edit';
import { MateImage } from '../common/mate-image/mate-image';
import { PetImage } from '../common/pet-image/pet-image';
import { AgeInfo } from '../common/age';
import { GenderInfo } from '../common/gender';
import { LastActivity } from '../common/last-activity';
import { PlaceIcon } from '../common/place-icon/place-icon';
import { config } from './config';
import { TimeAgo } from '../common/timeago';
import { PlacesService } from '../providers/places.service';
import { ReportsService } from '../providers/reports.service';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { PetService } from '../providers/pet.service';
import { DistancePipe } from '../pipes/distance';

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
    StartWalkPage,

    MatesPage,
    MateViewPage,
    MatesSearchPage,
    MatesAcceptedPage,
    MatesPendingPage,
    MatesRequestedPage,

    NearbyPage,
    NearbyPeoplePage,
    NearbyPetsPage,
    NearbyEventsPage,
    EventEditPage,
    EventViewPage,
    NearybyPlacesPage,
    PlaceEditPage,
    ReportModalPage,

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
        DistancePipe
    ],
    imports: [
        IonicModule.forRoot(
            PetMatesApp,
            Object.assign(config, {
                tabsPlacement: 'bottom'
            })
        ),
        IonicImageViewerModule
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
        EventsService,
        PlacesService,
        ReportsService,
        PetService
    ]
})
export class AppModule {
}
