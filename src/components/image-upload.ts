import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ApiService } from '../providers/api.service';
import { IResponseUpload } from '../models/interfaces/IResponseUpload';
import { ImagePicker } from 'ionic-native';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'image-upload',
    template:`
        <div (click)="changePicture()">
            <ng-content select="test"></ng-content>
            <input #fileInput class="fileInput" type="file" (change)="fileChangeEvent($event)"/>
        </div>
    `
})

export class ImageUpload {
    @Output() uploadSuccess: EventEmitter<IResponseUpload> = new EventEmitter<IResponseUpload>();
    @ViewChild('fileInput') fileInput: ElementRef;

    constructor(private apiService: ApiService,
                private platform: Platform) {
    }

    changePicture() {
        if (this.platform.is('cordova')) {
            ImagePicker.getPictures({
                maximumImagesCount: 1,
                width: 500,
                height: 500
            }).then(images => {
                if (images && images.length > 0) {
                    this.apiService
                        .upload(images[0])
                        .subscribe(this.uploadSuccess.emit.bind(this));
                }
            });
        } else {
            // web
            this.fileInput.nativeElement.click();
        }
    }

    fileChangeEvent(fileInput: any) {
        this.apiService
            .upload(fileInput.target.files[0])
            .subscribe(this.uploadSuccess.emit.bind(this));
    }
}
