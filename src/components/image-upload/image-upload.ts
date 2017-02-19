import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ApiService } from '../../providers/api.service';
import { IResponseUpload } from '../../models/interfaces/IResponseUpload';
import { ImagePicker } from 'ionic-native';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'image-upload',
    template:`
        <ng-content (click)="changePicture()"></ng-content>
        <p class="change-text">Change</p>
        <input #fileInput class="fileInput" type="file" (change)="fileChangeEvent($event)"/>
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
                    this.upload(images[0]);
                }
            });
        } else {
            // web
            this.fileInput.nativeElement.click();
        }
    }

    fileChangeEvent(fileInput: any) {
        this.upload(fileInput.target.files[0]);
    }

    private upload(file) {
        this.apiService
            .upload(file)
            .subscribe(this.uploadSuccess.emit.bind(this));
    }
}
