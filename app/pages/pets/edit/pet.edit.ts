import {Page, ViewController, NavParams, Alert, NavController, Config, IonicApp} from 'ionic-angular';
import {DatePicker, Camera} from 'ionic-native';
import {FormBuilder, ControlGroup, Validators} from 'angular2/common';
import {forwardRef} from 'angular2/core';
import {BreedService} from '../../../services/breed.service';
import {PetService} from '../../../services/pet.service';
import {Pet} from '../../../models/pet.model';
import {PetImage} from '../../../common/pet-image';

@Page({
    providers: [PetService],
    directives: [
        forwardRef(() => PetImage)
    ],
    templateUrl: 'build/pages/pets/edit/pet.edit.html'
})
export class PetEditPage {
    pet:Pet;
    petForm:ControlGroup;
    isNew:boolean = true;
    breeds:Array<any> = [];
    picture:any;

    private nav:NavController;

    constructor(public viewCtrl:ViewController,
                private pets:PetService,
                private breedService:BreedService,
                navParams:NavParams,
                fb:FormBuilder,
                private config:Config,
                private app:IonicApp) {
        this.nav = this.app.getActiveNav();
        let petParams = navParams.get('pet');

        if (petParams) {
            this.pet = JSON.parse(JSON.stringify(petParams));
            if (this.pet.birthday) {
                this.pet.birthday = new Date(<any>this.pet.birthday);
            }
            this.isNew = false;
        } else {
            this.pet = new Pet();
        }

        this.petForm = fb.group({
            name: ['', Validators.required],
            breed: ['', Validators.required],
        });

        breedService.breeds$.subscribe((breeds) => this.breeds = breeds);
        breedService.getAll();
    }

    save():void {
        if (this.petForm.valid) {
            this.pets.save(this.pet).subscribe(() => {
                if (this.nav.canGoBack()) {
                    this.nav.pop();
                } else {
                    this.viewCtrl.dismiss();
                }
            });
        }
    }

    remove():void {
        if (!this.isNew) {
            let alert = Alert.create({
                title: 'Removing ' + this.pet.name,
                message: 'Are you sure?',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => {
                            this.pets.deletePet(this.pet).subscribe(() => {
                                setTimeout(() => {
                                    this.nav.pop();
                                }, 1000);
                            });
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
    }

    onSelectBreed(breedId:string):void {
        let newBreed = this.breedService.findBreedById(breedId);
        if (newBreed) {
            this.pet.breed.name = newBreed.name;
        }
    }

    onSelectBirthday():void {
        DatePicker.show({
            date: new Date(),
            mode: 'date'
        }).then(
            date => this.pet.birthday = date,
            err => {
                this.pets.events.publish('alert:err', err);
                this.pet.birthday = null;
            }
        );
    }

    changePicture() {
        if ((<any>navigator).camera && FileTransfer) {
            Camera.getPicture({
                destinationType: 1, // 0=DATA_URL 1=FILE_URI
                cameraDirection: 1, // FRONT
                // targetWidth: 600,
                // targetHeight: 300,
            }).then((imageData) => {
                    var options = new FileUploadOptions();
                    options.fileKey = 'picture';
                    options.headers = {
                        'Authorization': this.pets.auth.token
                    };

                    var ft = new FileTransfer();
                    ft.upload(imageData, encodeURI(`${this.config.get('API')}/user/upload`),
                        (res) => {
                            res.response = JSON.parse(res.response);

                            if (res.response.success) {
                                this.pet.pic = res.response.file.url;
                                // replace
                                let index = this.pets.auth.getPetIndexById(this.pet._id);
                                if (index > -1) {
                                    this.pets.auth.user.pets[index] = this.pet;
                                }
                            } else {
                                this.pets.events.publish('alert:error', res.response.msg);
                            }
                        },
                        (err) => {
                            this.pets.events.publish('alert:error', err.text());
                        }, options);
                },
                (err) => {
                    this.pets.events.publish('alert:error', err.text());
                });
        }
    }

    // dev
    public fileChangeEvent(fileInput:any) {
        this.picture = <Array<File>> fileInput.target.files[0];
        this.pets.upload(this.picture, this.pet);
    }
}
