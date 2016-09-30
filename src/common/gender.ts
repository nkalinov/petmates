import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
    selector: '[gender]'
})
export class GenderInfo implements OnInit {
    @Input() gender:string;

    constructor(private el:ElementRef) {
    }

    ngOnInit() {
        this.el.nativeElement.textContent = (this.gender === 'm') ? 'Male' : 'Female';
    }
}
