import {Pipe, ChangeDetectorRef} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {AsyncPipe} from 'angular2/common';

@Pipe({
    name: 'messageTime',
    pure: false
})
export class MessageTimePipe extends AsyncPipe {
    value:Date;
    prefix:string = '';
    timer:Observable<string>;

    constructor(ref:ChangeDetectorRef) {
        super(ref);
    }

    transform(obj:any, args?:any[]):any {
        if (obj instanceof Date) {
            this.value = obj;
            if (args.length) {
                this.prefix = args[0];
            }

            if (!this.timer) {
                this.timer = this.getObservable();
            }

            return super.transform(this.timer, args);
        }

        return super.transform(obj, args);
    }

    private getObservable() {
        return Observable.interval(1000).startWith(0).map(()=> {
            var result:string;
            // current time
            let now = new Date().getTime();

            // time since message was sent in seconds
            let delta = (now - this.value.getTime()) / 1000;

            // format string
            if (delta < 10) {
                result = 'now';
            }
            else if (delta < 60) { // sent in last minute
                // result = Math.floor(delta) + ' seconds ago';
                result = 'now';
            }
            else if (delta < 3600) { // sent in last hour
                result = Math.floor(delta / 60) + 'm ago';
            }
            else if (delta < 86400) { // sent on last day
                result = Math.floor(delta / 3600) + 'h ago';
            }
            else if (delta < (2 * 86400)) { // sent yesterday
                result = Math.floor(delta / 86400) + 'd ago';
            }
            else { // sent more than 2 days ago
                result = '2d+ ago';
            }
            return this.prefix + result;
        });
    };
}