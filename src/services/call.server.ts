import { Injectable } from "@angular/core";
import * as SIP from 'sip.js/dist/sip';

@Injectable()
export class CallService {

    constructor() {
        this.initLine();
    }

    sipOptions = {
        uri: '2000@195.201.176.216',
        transportOptions: {
            wsServers: ['wss://195.201.176.216:8089']
        },
        // Replace this with the username from your sip.conf file
        authorizationUser: '2000',

        // Replace this with the password from your sip.conf file
        password: '20002000',
        // media: {
        //     local: {
        //         video: this.localVideo.nativeElement
        //     },
        //     remote: {
        //         video: this.remoteVideo.nativeElement,
        //         // This is necessary to do an audio/video call as opposed to just a video call
        //         audio: this.remoteVideo.nativeElement
        //     }
        // },
        ua: {}
    };
    line: any;
    session: any;

    initLine() {
        this.line = new SIP.UA(this.sipOptions);
        this.line.register();
        this.initHandler();
    }


    invite() {
        this.line.invite('1000', {
            sessionDescriptionHandlerOptions: {
                constraints: {
                    audio: true,
                    video: false
                }
            }
        })
    }

    initHandler() {
        this.line.on('registered', (data) => {
            console.log(data);
        });

        this.line.on('registrationFailed', function (cause) {
            console.log(cause);
        });

        this.line.on('unregistered', function (data) {
            console.log(data);
        });
        this.line.on('invite', function (incomingSession) {
            this.session = incomingSession;
            var number_show = this.session.remoteIdentity.displayName;

            if (confirm(number_show + ' ok?')) {
                this.session.accept();

            } else {
                this.session.reject();
            }
        });
    }

}