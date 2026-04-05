import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.component.html'
})
export class PartnersComponent  {

  partners: any[] = [];
  partner: any = {};

  // ngOnInit() {
  //   this.load();
  // }

 

}