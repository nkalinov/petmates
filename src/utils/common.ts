import { MatesPage } from '../pages/mates/mates';
import { MapPage } from '../pages/map/MapPage';
import { AuthPage } from '../pages/auth/auth.page';
import { ProfilePage } from '../pages/profile/profile.page';
import { HelpPage } from '../pages/help/help';
import { ConversationsListPage } from '../pages/chat/chats-list.page';
import { NearbyPage } from '../pages/nearby/nearby';

export function localISO(dateString?: string) {
    let date;

    if (dateString) {
        date = new Date(dateString);
    } else {
        date = new Date();
        date.setHours(18);
        date.setMinutes(0);
    }

    const tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            const norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };


    return date.getFullYear()
        + '-' + pad(date.getMonth() + 1)
        + '-' + pad(date.getDate())
        + 'T' + pad(date.getHours())
        + ':' + pad(date.getMinutes())
        + ':' + pad(date.getSeconds())
        + dif + pad(tzo / 60)
        + ':' + pad(tzo % 60);
}

export function getMenu(auth: boolean = false): any[] {
    const publicPages = [
        { title: 'Login / sign-up', component: AuthPage },
        { title: 'Help', component: HelpPage }
        // {title: 'Donate', component: DonatePage} // todo
    ], loggedInPages = [
        { title: 'Map', component: MapPage },
        { title: 'Explore', component: NearbyPage },
        { title: 'Chats', component: ConversationsListPage },
        { title: 'Mates', component: MatesPage, id: 'mates' },
        { title: 'My profile', component: ProfilePage },
        { title: 'Help', component: HelpPage }
        // {title: 'Donate', component: DonatePage} // todo
    ];
    return auth ? loggedInPages : publicPages;
}

export function getTimeAgo(date) {
    let result: string;
    // current time
    let now = new Date().getTime();

    // time since message was sent in seconds
    let delta = (now - date) / 1000;

    // format string
    if (delta < 10) {
        result = 'now';
    } else if (delta < 60) { // sent in last minute
        // result = Math.floor(delta) + ' seconds ago';
        result = 'now';
    } else if (delta < 3600) { // sent in last hour
        result = Math.floor(delta / 60) + 'm ago';
    } else if (delta < 86400) { // sent on last day
        result = Math.floor(delta / 3600) + 'h ago';
    } else if (delta < (2 * 86400)) { // sent yesterday
        result = Math.floor(delta / 86400) + 'd ago';
    } else { // sent more than 2 days ago
        result = '2d+ ago';
    }
    return result;
}

export function getAge(fromdate, todate?) {
    if (todate) {
        todate = new Date(todate);
    } else {
        todate = new Date();
    }
    fromdate = new Date(fromdate);

    let age = [],
        y = [todate.getFullYear(), fromdate.getFullYear()],
        ydiff = y[0] - y[1],
        m = [todate.getMonth(), fromdate.getMonth()],
        mdiff = m[0] - m[1],
        d = [todate.getDate(), fromdate.getDate()],
        ddiff = d[0] - d[1];

    if (mdiff < 0 || (mdiff === 0 && ddiff < 0)) {
        --ydiff;
    }
    if (mdiff < 0) {
        mdiff += 12;
    }
    if (ddiff < 0) {
        fromdate.setMonth(m[1] + 1, 0);
        ddiff = fromdate.getDate() - d[1] + d[0];
        --mdiff;
    }
    if (ydiff > 0) {
        age.push(ydiff + ' year' + (ydiff > 1 ? 's ' : ' '));
    }
    if (mdiff > 0) {
        age.push(mdiff + ' month' + (mdiff > 1 ? 's' : ''));
    }
    // if (ddiff > 0) age.push(ddiff + ' day' + (ddiff > 1 ? 's' : ''));
    if (age.length > 1) {
        age.splice(age.length - 1, 0, ' and ');
    }
    return age.join('');
}

export function makeFileRequest(url: string, file: File, token?: string, fieldName: string = 'picture') {
    return new Promise((resolve, reject) => {
        let formData: any = new FormData();
        let xhr = new XMLHttpRequest();
        formData.append(fieldName, file, file.name);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve({ response: JSON.parse(xhr.response) });
                } else {
                    reject(JSON.parse(xhr.response));
                }
            }
        };
        xhr.open('POST', url, true);
        if (token) {
            xhr.setRequestHeader('Authorization', token);
        }
        xhr.send(formData);
    });
}
