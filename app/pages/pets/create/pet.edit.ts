import {Page, ViewController, NavParams, Alert, NavController} from 'ionic-angular';
import {Pet} from '../../../models/pet.model';
import {FormBuilder, ControlGroup, Validators} from 'angular2/common';
import {BreedService} from '../../../services/breed.service';
import {PetService} from '../../../services/pet.service';
import {DatePicker, Camera} from 'ionic-native';

@Page({
    providers: [PetService],
    templateUrl: 'build/pages/pets/create/pet.create.html'
})
export class PetCreate {
    pet:Pet;
    petForm:ControlGroup;
    isNew:boolean = true;
    breeds:Array<any> = [];
    picture:any;

    constructor(private viewCtrl:ViewController,
                private pets:PetService,
                private breedService:BreedService,
                navParams:NavParams,
                fb:FormBuilder,
                private nav:NavController) {
        let pet = navParams.get('pet');

        if (!pet) {
            this.pet = new Pet();
        } else {
            this.pet = JSON.parse(JSON.stringify(pet));
            if (this.pet.birthday) {
                this.pet.birthday = new Date(this.pet.birthday);
            }
            this.isNew = false;
        }

        this.petForm = fb.group({
            name: ['', Validators.required],
        });

        breedService.breeds$.subscribe((breeds) => this.breeds = breeds);
        breedService.getAll();
    }

    public cancel():void {
        this.viewCtrl.dismiss();
    }

    public save():void {
        if (this.petForm.valid) {
            this.pets.save(this.pet)
                .subscribe(() => {
                    this.viewCtrl.dismiss();
                });
        }
    }

    public deletePet():void {
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
                            this.pets.deletePet(this.pet)
                                .subscribe(() => {
                                    this.viewCtrl.dismiss();
                                });
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
    }

    public onSelectBreed(breedId:string):void {
        let newBreed = this.breedService.findBreedById(breedId);
        if (newBreed) {
            this.pet.breed.name = newBreed.name;
        }
    }

    public onSelectBirthday():void {
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

    public changePicture() {
        if ((<any>navigator).camera && FileTransfer && !this.isNew) {
            Camera.getPicture({
                destinationType: 1, // 0=DATA_URL 1=FILE_URI
                cameraDirection: 1, // FRONT
                // targetWidth: 600,
                // targetHeight: 300,
            }).then((imageData) => {
                    var options = new FileUploadOptions();
                    options.fileKey = 'picture';
                    options.headers = {
                        'Authorization': this.pets.auth.local.get('id_token')._result
                    };

                    var ft = new FileTransfer();
                    ft.upload(imageData, encodeURI('http://localhost:3001/users/upload'),
                        (res) => {
                            console.log(res);
                            res.response = JSON.parse(res.response);

                            if (res.response.success) {
                                this.pet.picture = res.response.file.url;
                                // replace
                                let index = this.pets.auth.getPetIndexById(this.pet._id);
                                if (index > -1) {
                                    this.pets.auth.user.pets[index] = this.pet;
                                }
                                this.pets.auth.updateProfileToken();
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
