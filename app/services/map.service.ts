import {Injectable} from "angular2/core";
import {Config} from "ionic-angular/index";
import {Socket} from "net";
var io = require('../../api/node_modules/socket.io-client');

@Injectable()
export class MapService {
    out:boolean = false; // out for a walk ?
    private socket:Socket;

    constructor(private config:Config) {
        this.socket = io.connect(this.config.get('API'));

        this.socket.on('coords', function (data) {
            console.log(data);
        });
        
        this.socket.on('mate:connected', function (data) {
            console.log(data);
        });
    }
}