import { ViewController, NavParams, Alert, NavController, Config, App } from 'ionic-angular';
import { ImagePicker } from 'ionic-native';
import { FormBuilder, ControlGroup, Validators } from '@angular/common';
import { forwardRef, Component } from '@angular/core';
import { BreedService } from '../../../services/breed.service';
import { PetService } from '../../../services/pet.service';
import { Pet } from '../../../models/pet.model';
import { PetImage } from '../../../common/pet-image';

@Component({
    providers: [PetService],
    directives: [
        forwardRef(() => PetImage)
    ],
    templateUrl: 'build/pages/pets/edit/pet.edit.html'
})
export class PetEditPage {
    pet: Pet;
    petForm: ControlGroup;
    isNew: boolean = true;
    breeds: Array<any> = [];
    picture: any;

    private nav: NavController;

    constructor(public viewCtrl: ViewController,
                private pets: PetService,
                private breedService: BreedService,
                navParams: NavParams,
                fb: FormBuilder,
                private config: Config,
                private app: App) {
        this.nav = this.app.getActiveNav();
        let petParams = navParams.get('pet');

        if (petParams) {
            this.pet = petParams;
            this.pet = Object.assign({}, petParams);
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

    save(): void {
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

    remove(): void {
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

    onSelectBreed(breedId: string): void {
        let newBreed = this.breedService.findBreedById(breedId);
        if (newBreed) {
            this.pet.breed.name = newBreed.name;
        }
    }

    changePicture() {
        ImagePicker.getPictures({
            // max images to be selected, defaults to 15. If this is set to 1, upon
            // selection of a single image, the plugin will return it.
            maximumImagesCount: 1,

            // max width and height to allow the images to be.  Will keep aspect
            // ratio no matter what.  So if both are 800, the returned image
            // will be at most 800 pixels wide and 800 pixels tall.  If the width is
            // 800 and height 0 the image will be 800 pixels wide if the source
            // is at least that wide.
            width: 200,
            height: 200,

            // quality of resized image, defaults to 100
            quality: 60
        }).then((images) => {
                let options = new FileUploadOptions();
                options.fileKey = 'picture';
                options.headers = {
                    'Authorization': this.pets.auth.token
                };
                let ft = new FileTransfer();
                ft.upload(images[0], encodeURI(`${this.config.get('API')}/user/upload`),
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

    // dev
    public fileChangeEvent(fileInput: any) {
        this.picture = <Array<File>> fileInput.target.files[0];
        this.pets.upload(this.picture, this.pet);
    }
}
