export const UserIcon = (<any>L.Icon).extend({
    options: {
        iconSize: [35, 35], // size of the icon
        iconAnchor: [18, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow,
        className: 'user-marker'
    }
});

const VetIcon = (<any>L.Icon).extend({
    options: {
        iconSize: [25, 33], // size of the icon
        iconAnchor: [13, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
    }
});

export const vetIcon = (customIcon?) => new VetIcon({ iconUrl: customIcon || '../assets/img/hospital_marker.png' });
