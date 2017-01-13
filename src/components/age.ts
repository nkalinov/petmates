import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import { getAge } from '../utils/common';

@Directive({
    selector: '[age]'
})

export class AgeInfo implements OnInit {
    @Input() age:any;

    constructor(private el:ElementRef) {
    }

    ngOnInit() {
        this.el.nativeElement.textContent = getAge(this.age);
    }
}
