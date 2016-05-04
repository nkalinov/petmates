import {Directive, ElementRef, Input, OnInit} from 'angular2/core';
import {CommonService} from '../services/common.service';

@Directive({
    selector: '[age]'
})

export class AgeInfo implements OnInit {
    @Input() age:any;

    constructor(private el:ElementRef) {
    }

    ngOnInit() {
        this.el.nativeElement.textContent = CommonService.getAge(this.age);
    }
}