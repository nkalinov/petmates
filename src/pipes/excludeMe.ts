import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../pages/auth/auth.service';
import { User } from '../models/User';

@Pipe({
    name: 'excludeMe'
})

export class ExcludeMePipe implements PipeTransform {
    constructor(private authService: AuthService) {
    }

    transform(value: User[], returnFirst: boolean = false) {
        const filtered = value.filter(item => item._id !== this.authService.user._id);

        return returnFirst && filtered[0] || filtered;
    }
}

