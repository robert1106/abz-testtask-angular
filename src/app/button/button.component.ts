import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.sass']
})
export class ButtonComponent implements OnInit {

  @Input() textBtn: any;
  @Input() disabled: any;
  @Output() clickBtn = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  addNewItem() {
    this.clickBtn.emit();
  }

}
