import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ApiService } from '../../providers/api.service';
import { IResponseUpload } from '../../models/interfaces/IResponseUpload';
import { ImagePicker } from '@ionic-native/image-picker';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'image-upload',
    template: `
        <div (click)="changePicture()">
            <ng-content></ng-content>
            <p *ngIf="placeholder" class="change-text">{{placeholder}}</p>
            <input #fileInput class="fileInput" type="file" (change)="fileChangeEvent($event)"/>
        </div>
    `
})

export class ImageUpload {
    @Input() placeholder: string = 'Click to change';
    @Output() uploadSuccess: EventEmitter<IResponseUpload> = new EventEmitter<IResponseUpload>();

    @ViewChild('fileInput') fileInput: ElementRef;

    constructor(private apiService: ApiService,
                private imagePicker: ImagePicker,
                private platform: Platform) {
    }

    changePicture() {
        if (this.platform.is('cordova')) {
            this.imagePicker.getPictures({
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
            .subscribe(res => {
                this.uploadSuccess.emit(res);
            });
    }
}
