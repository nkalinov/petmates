export class Pet {
    _id: string;
    name: string;
    sex: string = 'm';
    breed: {
        _id: string,
        name: string
    } = {
        _id: '',
        name: ''
    };
    pic: string;
    birthday: Date = new Date();

    constructor(data?) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
