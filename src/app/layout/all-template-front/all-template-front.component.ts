import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderFrontComponent } from '../../components/header-front/header-front.component';
import { FooterFrontComponent } from '../../components/footer-front/footer-front.component';
import { Chatbot } from '../../components/chatbot/chatbot';

@Component({
  selector: 'app-all-template-front',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderFrontComponent,
    FooterFrontComponent,
    Chatbot
  ],
  templateUrl: './all-template-front.component.html',
  styleUrls: ['./all-template-front.component.scss']
})
export class AllTemplateFrontComponent {}