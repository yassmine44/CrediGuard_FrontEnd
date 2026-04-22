import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance';
import { InsuranceService } from '../../services/insurance.service';
import { PolicyService } from '../../services/policy.service';
import { AuthService } from '../../core/services/auth.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
  hasAction?: boolean;
}

type ConversationState = 'IDLE' | 'AWAITING_AMOUNT' | 'AWAITING_DURATION';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  financeService = inject(FinanceService);
  insuranceService = inject(InsuranceService);
  policyService = inject(PolicyService);
  authService = inject(AuthService);
  private http = inject(HttpClient);

  isOpen = false;
  isLoading = false;
  userInput = '';
  state: ConversationState = 'IDLE';
  collectedData = { amount: 0, duration: 0 };

  messages: Message[] = [
    { text: 'Bonjour ! Je suis votre assistant CrediGuard. Comment puis-je vous aider aujourd\'hui ? (Finance, Assurance, Partenaires...)', sender: 'bot', time: new Date() }
  ];

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    this.messages.push({
      text: this.userInput,
      sender: 'user',
      time: new Date()
    });

    const question = this.userInput;
    const q = question.toLowerCase();
    this.userInput = '';

    // Handle Conversation Steps
    if (this.state === 'AWAITING_AMOUNT') {
      const amount = parseInt(q.replace(/[^0-9]/g, ''));
      if (isNaN(amount)) {
        this.addBotMessage("Veuillez saisir un montant valide (ex: 5000).");
      } else {
        this.collectedData.amount = amount;
        this.state = 'AWAITING_DURATION';
        this.addBotMessage(`Entendu, ${amount} DT. Et sur quelle durée de remboursement prévoyez-vous ce crédit (en mois) ?`);
      }
      return;
    }

    if (this.state === 'AWAITING_DURATION') {
      const duration = parseInt(q.replace(/[^0-9]/g, ''));
      if (isNaN(duration)) {
        this.addBotMessage("Veuillez saisir une durée valide en mois (ex: 48).");
      } else {
        this.collectedData.duration = duration;
        this.state = 'IDLE';
        this.simulateAILogic();
      }
      return;
    }

    this.isLoading = true;
    const user = this.authService.getUser();
    const clientId = user ? (user as any).id : undefined;

    this.insuranceService.askChatbot(question, clientId).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Use the action returned by backend to trigger frontend states
        if (res.suggestedAction === 'START_SIMULATION') {
            this.state = 'AWAITING_AMOUNT';
            this.addBotMessage(res.response);
        } else if (res.intent === 'RECOMMENDATION' && res.data) {
          this.addBotMessage(res.response, true);
        } else if (res.suggestedAction === 'SHOW_OFFERS') {
          this.addBotMessage(res.response, true);
        } else {
          this.addBotMessage(res.response);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Chatbot API error:", err);
        
        // Fallback to local logic if backend fails
        if (q.includes('finance') || q.includes('solde') || q.includes('argent') || q.includes('compte')) {
          this.addBotMessage(this.financeService.getChatbotResponse(question));
        } else if (q.includes('recommandation') || q.includes('conseil')) {
          this.state = 'AWAITING_AMOUNT';
          this.addBotMessage("D'accord, aidons-nous du moteur de risque local. Quel serait le montant du crédit que vous souhaitez couvrir ?");
        } else {
          this.addBotMessage("Je suis désolé, j'ai du mal à me connecter à mon cerveau principal. Comment puis-je vous aider localement ?");
        }
      }
    });

    this.scrollToBottom();
  }

  simulateAILogic() {
    this.addBotMessage("Analyse de votre profil en cours (STAR, COMAR, GAT Assurances)... ⏳");
    
    setTimeout(() => {
      const amount = this.collectedData.amount;
      let offer = "STAR Sécurité";
      let reason = "votre montant élevé nécessite une garantie premium.";
      
      if (amount < 10000) {
        offer = "COMAR Lite";
        reason = "votre besoin est modéré, nous privilégions une prime basse.";
      } else if (amount > 100000) {
        offer = "GAT Platinum";
        reason = "une couverture maximale est requise pour ce type de financement.";
      }

      this.addBotMessage(`Simulation terminée ! 🧠 \nChoix conseillé : **${offer}**. \nExplication : ${reason} \nSouhaitez-vous souscrire ?`, true);
    }, 1500);
  }

  subscribeAction() {
    const user = this.authService.getUser();
    if (!user) {
      this.addBotMessage("Erreur : vous devez être connecté pour souscrire.");
      return;
    }

    this.addBotMessage("Parfait ! Je prépare votre dossier de souscription pour validation...");
    
    // We need real IDs to avoid 400 Bad Request
    // First, let's try to get available offers to pick a real one
    this.insuranceService.getOffers().subscribe({
      next: (offers) => {
        const selectedOffer = offers.length > 0 ? offers[0] : { id: 1 };
        
        // Similarly for companies
        this.http.get<any[]>('http://localhost:8082/api/insurance/companies').subscribe({
          next: (companies: any[]) => {
             const selectedCompany = companies.length > 0 ? companies[0] : { id: 1 };

             const newPolicy = {
                policyNumber: 'POL-' + Math.floor(Math.random() * 1000000),
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                insuranceCompany: { id: selectedCompany.id },
                insuranceOffer: { id: (selectedOffer as any).id },
                client: { id: (user as any).id }
             };

              this.policyService.create(newPolicy as any).subscribe({
                next: () => {
                  this.addBotMessage("✅ Votre demande a été transmise avec succès à l'assureur ! Elle est actuellement en attente de validation (Statut: PENDING).");
                  this.addBotMessage("Vous pouvez suivre l'état de votre dossier dans votre espace client.");
                },
                error: (err) => {
                  console.error("API Error:", err);
                  this.addBotMessage("Désolé, une erreur technique est survenue lors de la transmission. Veuillez réessayer plus tard.");
                }
              });
          },
          error: () => this.addBotMessage("Erreur : Impossible de contacter la compagnie d'assurance.")
        });
      },
      error: () => this.addBotMessage("Erreur : Impossible de récupérer les offres disponibles.")
    });
  }

  private addBotMessage(text: string, hasAction: boolean = false) {
    this.messages.push({
      text,
      sender: 'bot',
      time: new Date(),
      hasAction
    });
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      }, 0);
    } catch (err) { }
  }
}
