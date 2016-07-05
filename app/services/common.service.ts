import { Injectable } from '@angular/core';
import { MatesPage } from '../pages/mates/mates.ts';
import { PetsPage } from '../pages/pets/pets';
import { MapPage } from '../pages/map/map';
import { AuthModal } from '../pages/auth/auth';
import { ProfilePage } from '../pages/profile/profile';
import { HelpPage } from '../pages/help/help';
import { ConversationsListPage } from '../pages/chat/conversations.list.ts';
import { Page } from '../models/page.interface';

@Injectable()
export class CommonService {

    static getMenu(auth?:boolean = false):Array<Page> {
        let commonPages = [
            // {title: 'Help', component: HelpPage}
        ];
        let publicPages = [
            { title: 'Login / sign-up', component: AuthModal }
        ];
        let loggedInPages = [
            { title: 'Map', component: MapPage },
            { title: 'Chats', component: ConversationsListPage },
            { title: 'My mates', component: MatesPage, id: 'mates' },
            { title: 'My pets', component: PetsPage },
            { title: 'Account', component: ProfilePage }
        ];
        return auth ? loggedInPages.concat(commonPages) : publicPages.concat(commonPages);
    }

    static getTimeAgo(date) {
        let result:string;
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

    static getAge(fromdate, todate?) {
        if (todate) {
            todate = new Date(todate);
        } else {
            todate = new Date();
        }

        let age = [],
            fromdate = new Date(fromdate),
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

    /**
     *
     * @param url
     * @param file
     * @param token
     * @param fieldName
     * @returns {Promise<R>|Promise<T>|Promise}
     */
    static makeFileRequest(url:string, file:File, token?:string, fieldName:string = 'picture') {
        return new Promise((resolve, reject) => {
            let formData:any = new FormData();
            let xhr = new XMLHttpRequest();
            formData.append(fieldName, file, file.name);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve({ response: JSON.parse(xhr.response) });
                    } else {
                        reject(xhr.response);
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
}
