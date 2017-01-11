const icons = {
    user: '../assets/img/default_user.gif',
    pet: '../assets/img/default_pet.jpg',
    vet: '../assets/img/hospital_marker.png'
};

export default icons;

export const WalkMarkerIcon = (<any>L.Icon).extend({
    options: {
        iconSize: [35, 35], // size of the icon
        iconAnchor: [18, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
    }
});

export const userIcon = (iconUrl, className = 'user-marker') => new WalkMarkerIcon({ iconUrl: iconUrl || icons.user, className });
export const petIcon = (iconUrl, className = 'user-marker') => new WalkMarkerIcon({ iconUrl: iconUrl || icons.pet, className });

const CustomMarkerIcon = (<any>L.Icon).extend({
    options: {
        iconSize: [25, 33], // size of the icon
        iconAnchor: [13, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
    }
});

export const customMarkerIcon = iconUrl => new CustomMarkerIcon({ iconUrl });
