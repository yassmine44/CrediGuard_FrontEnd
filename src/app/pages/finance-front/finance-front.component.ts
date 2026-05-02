import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';


import {
  CompteTypeApi,
  CreateRegleRemboursementRequest,
  CreateRemboursementRequest,
  CreateTransactionRequest,
  FinanceService,
  FinanceCreditApi,
  RegleRemboursementApi,
  RemboursementApi,
  Transaction,
  TransactionApi,
  TransactionStatutApi,
  TransactionTypeApi
} from '../../services/finance';
import { Chatbot } from '../../components/chatbot/chatbot';
import { UserService ,UserProfileResponse} from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

type AccountFormField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'idType'
  | 'idFile'
  | 'initialBalance'
  | 'typeCompte';

type DeleteEntity = 'account' | 'transaction' | 'remboursement';

interface DeleteDialogState {
  open: boolean;
  entity: DeleteEntity | null;
  id: number | null;
  title: string;
  description: string;
}

@Component({
  selector: 'app-finance-front',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    FormsModule,
    RouterLink,
    Chatbot
  ],
  templateUrl: './finance-front.component.html',
  styleUrls: ['./finance-front.component.scss']
})
export class FinanceFrontComponent implements OnInit {
  private financeService = inject(FinanceService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  user = this.financeService.currentUser;
  account = this.financeService.currentAccount;
  transactions = this.financeService.transactions;

  hasAccount = this.financeService.hasFinancialAccount;
  creditStats = this.financeService.creditStats;
  productSales = this.financeService.productSales;
  budget = this.financeService.budget;

  loadingApi = signal(false);
  apiMessage = signal<string | null>(null);
  apiError = signal<string | null>(null);

  remboursementsApi = signal<RemboursementApi[]>([]);
  reglesApi = signal<RegleRemboursementApi[]>([]);
  availableCredits = signal<FinanceCreditApi[]>([]);

  selectedCreditId: number | null = null;
  selectedTransaction: TransactionApi | null = null;
  editingTransactionId: number | null = null;
  editingRemboursementId: number | null = null;

  readonly deleteDialog = signal<DeleteDialogState>({
    open: false,
    entity: null,
    id: null,
    title: '',
    description: ''
  });
  readonly accountFormErrors = signal<Partial<Record<AccountFormField, string>>>({});
  readonly transactionFormError = signal<string | null>(null);
  readonly remboursementFormError = signal<string | null>(null);

  accountForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idType: 'CIN',
    idFile: null as File | null,
    initialBalance: 0,
    typeCompte: 'BENEFICIAIRE' as CompteTypeApi
  };

  transactionForm = {
    typeTransaction: 'VENTE' as TransactionTypeApi,
    montant: null as number | null,
    compteDestinationId: null as number | null,
    orderId: null as number | null,
    statut: 'COMPLETED' as TransactionStatutApi
  };

  remboursementForm = {
    creditId: null as number | null,
    montant: null as number | null,
    mode: 'automatique',
    transactionId: null as number | null
  };

  regleForm = {
    creditId: null as number | null,
    typeRegle: 'POURCENTAGE_SUR_VENTE' as const,
    valeur: null as number | null
  };

  searchTerm = '';
  statusFilter = 'Tous les statuts';

  private extractApiError(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') {
      return fallback;
    }

    const anyErr = err as { error?: unknown; message?: string };
    const errorPayload = anyErr.error;

    if (typeof errorPayload === 'string' && errorPayload.trim()) {
      return errorPayload;
    }

    if (errorPayload && typeof errorPayload === 'object') {
      const payloadObj = errorPayload as Record<string, unknown>;

      const preferred = payloadObj['message'] ?? payloadObj['error'];
      if (typeof preferred === 'string' && preferred.trim()) {
        return preferred;
      }

      const firstReadable = Object.values(payloadObj).find(
        (value) => typeof value === 'string' && value.trim()
      );

      if (typeof firstReadable === 'string') {
        return firstReadable;
      }
    }

    if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
      return anyErr.message;
    }

    return fallback;
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.loadingApi.set(false);
      this.apiError.set('Veuillez vous connecter pour acceder aux donnees financieres.');
      return;
    }

    this.bootstrapFromBackend();
  }

  get filteredTransactions(): Transaction[] {
    const term = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter;

    return this.transactions().filter(t => {
      const matchesSearch =
        t.client.toLowerCase().includes(term) ||
        t.id_transaction_str?.toLowerCase().includes(term);

      const matchesStatus =
        status === 'Tous les statuts' || t.statut === status;

      return matchesSearch && matchesStatus;
    });
  }

  get displayedRemboursements(): RemboursementApi[] {
    const selectedCredit = Number(this.selectedCreditId);
    if (selectedCredit > 0) {
      return this.remboursementsApi().filter((item) => item.creditId === selectedCredit);
    }

    return this.remboursementsApi();
  }

  private bootstrapFromBackend(): void {
    this.loadingApi.set(true);
    this.apiError.set(null);
    this.apiMessage.set(null);

   this.userService.getMyProfile().subscribe({
  next: (profile: UserProfileResponse) => {
    this.user.set({
      id_utilisateur: profile.id ?? this.user().id_utilisateur,
      nom: profile.fullName,
      role: this.mapProfileRole(profile.userType)
    });
    this.loadFinanceCollections();
  },
  error: () => {
    this.loadFinanceCollections();
  }
});


  }

  private loadFinanceCollections(): void {
    forkJoin({
      accounts: this.financeService.getAccountsApi(),
      transactions: this.financeService.getTransactionsApi(),
      remboursements: this.financeService.getRemboursementsApi(),
      regles: this.financeService.getReglesRemboursementApi(),
      summary: this.financeService.getFinanceSummary(),
      credits: this.financeService.getCreditsApi()
    }).subscribe({
      next: ({ accounts, transactions, remboursements, regles, summary, credits }) => {
        this.transactions.set(transactions.map((item) => this.mapTransactionApiToLegacy(item)));
        this.remboursementsApi.set(remboursements);
        this.reglesApi.set(regles);
        this.availableCredits.set(credits);

        this.creditStats.set({
          totalCredit: Math.max(summary.totalRevenue + summary.totalExpenses, 1),
          repaid: summary.totalRemboursements,
          remaining: Math.max(summary.totalRevenue + summary.totalExpenses - summary.totalRemboursements, 0)
        });

        const profileUserId = this.user().id_utilisateur;
        const accountForUser = accounts.find((acc) => acc.utilisateurId === profileUserId);

        if (accountForUser) {
          this.applyAccount(accountForUser.idCompte, accountForUser.solde, accountForUser.typeCompte, accountForUser.utilisateurId);
          this.loadTransactionsForCompte(accountForUser.idCompte);
        } else {
          this.loadCurrentAccountByUser();
        }

        this.loadingApi.set(false);
      },
      error: () => {
        this.loadingApi.set(false);
        this.apiError.set('Impossible de charger les donnees finance depuis le backend.');
      }
    });
  }

  private loadCurrentAccountByUser(): void {
    const userId = this.user().id_utilisateur;
    if (!userId) {
      this.hasAccount.set(false);
      return;
    }

    this.financeService.getAccountByUserIdApi(userId).subscribe({
      next: (account) => {
        this.hasAccount.set(true);
        this.applyAccount(account.idCompte, account.solde, account.typeCompte, account.utilisateurId);
        this.loadTransactionsForCompte(account.idCompte);
      },
      error: () => {
        this.hasAccount.set(false);
      }
    });
  }

  private applyAccount(id: number, solde: number, typeCompte: CompteTypeApi, utilisateurId: number): void {
    this.account.set({
      id_compte: id,
      solde,
      type_compte: this.mapCompteType(typeCompte),
      id_utilisateur: utilisateurId
    });
    this.hasAccount.set(true);
    this.resetTransactionForm();
  }

  private mapCompteType(typeCompte: CompteTypeApi): 'bénéficiaire' | 'partenaire' | 'plateforme' {
    if (typeCompte === 'PARTENAIRE') {
      return 'partenaire';
    }
    if (typeCompte === 'PLATEFORME') {
      return 'plateforme';
    }
    return 'bénéficiaire';
  }

  private mapProfileRole(userType: string | undefined): 'bénéficiaire' | 'partenaire' | 'admin' {
    if (userType === 'ADMIN') {
      return 'admin';
    }
    if (userType === 'PARTNER') {
      return 'partenaire';
    }
    return 'bénéficiaire';
  }

  private mapApiStatus(statut: TransactionStatutApi): Transaction['statut'] {
    if (statut === 'COMPLETED') {
      return 'Complété';
    }
    if (statut === 'FAILED') {
      return 'Annulé';
    }
    return 'En attente';
  }

  private mapApiType(type: TransactionTypeApi): Transaction['type_transaction'] {
    if (type === 'ACHAT') {
      return 'Achat';
    }
    if (type === 'REMBOURSEMENT') {
      return 'Remboursement';
    }
    return 'Vente';
  }

  private mapLegacyTypeToApi(type: Transaction['type_transaction']): TransactionTypeApi {
    if (type === 'Achat' || type === 'Retrait') {
      return 'ACHAT';
    }
    if (type === 'Remboursement') {
      return 'REMBOURSEMENT';
    }
    return 'VENTE';
  }

  private mapLegacyStatusToApi(status: Transaction['statut']): TransactionStatutApi {
    if (status === 'Complété') {
      return 'COMPLETED';
    }
    if (status === 'Annulé') {
      return 'FAILED';
    }
    return 'PENDING';
  }

  private mapTransactionApiToLegacy(item: TransactionApi): Transaction {
    return {
      id_transaction: item.idTransaction,
      id_transaction_str: `TRX-${String(item.idTransaction).padStart(3, '0')}`,
      client: `Client #${item.compteDestinationId}`,
      type_transaction: this.mapApiType(item.typeTransaction),
      montant: item.montant,
      date_transaction: new Date(item.dateTransaction),
      statut: this.mapApiStatus(item.statut),
      id_compte_source: item.compteSourceId,
      id_compte_destination: item.compteDestinationId
    };
  }

  private loadTransactionsForCompte(compteId: number): void {
    this.financeService.getTransactionsByCompteApi(compteId).subscribe({
      next: (items) => {
        this.transactions.set(items.map((item) => this.mapTransactionApiToLegacy(item)));
      },
      error: () => {
        this.apiError.set('Impossible de charger les transactions du compte.');
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?[0-9 ]{8,15}$/.test(phone);
  }

  clearAccountFieldError(field: AccountFormField): void {
    const errors = { ...this.accountFormErrors() };
    if (errors[field]) {
      delete errors[field];
      this.accountFormErrors.set(errors);
    }
  }

  onIdFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.accountForm.idFile = target.files && target.files.length > 0 ? target.files[0] : null;
    this.clearAccountFieldError('idFile');
  }

  private validateAccountForm(): boolean {
    const errors: Partial<Record<AccountFormField, string>> = {};

    const firstName = this.accountForm.firstName.trim();
    const lastName = this.accountForm.lastName.trim();
    const email = this.accountForm.email.trim();
    const phone = this.accountForm.phone.trim();
    const balance = Number(this.accountForm.initialBalance);

    if (firstName.length < 2) {
      errors.firstName = 'Le prenom doit contenir au moins 2 caracteres.';
    }

    if (lastName.length < 2) {
      errors.lastName = 'Le nom doit contenir au moins 2 caracteres.';
    }

    if (!this.isValidEmail(email)) {
      errors.email = 'Adresse email invalide.';
    }

    if (!this.isValidPhone(phone)) {
      errors.phone = 'Numero invalide (8 a 15 chiffres, + optionnel).';
    }

    if (!['CIN', 'Passeport'].includes(this.accountForm.idType)) {
      errors.idType = 'Type d identite invalide.';
    }

    if (!this.accountForm.idFile) {
      errors.idFile = 'Le document d identite est obligatoire.';
    }

    if (!Number.isFinite(balance) || balance < 0) {
      errors.initialBalance = 'Le solde initial doit etre un nombre positif ou nul.';
    }

    if (!['BENEFICIAIRE', 'PARTENAIRE', 'PLATEFORME'].includes(this.accountForm.typeCompte)) {
      errors.typeCompte = 'Type de compte invalide.';
    }

    this.accountFormErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private resetTransactionForm(): void {
    this.transactionForm = {
      typeTransaction: 'VENTE',
      montant: null,
      compteDestinationId: this.hasAccount() ? this.account().id_compte : null,
      orderId: null,
      statut: 'COMPLETED'
    };
    this.transactionFormError.set(null);
  }

  startEditTransaction(tx: Transaction): void {
    this.editingTransactionId = tx.id_transaction;
    this.transactionForm = {
      typeTransaction: this.mapLegacyTypeToApi(tx.type_transaction),
      montant: Math.abs(tx.montant),
      compteDestinationId: tx.id_compte_destination,
      orderId: tx.id_transaction,
      statut: this.mapLegacyStatusToApi(tx.statut)
    };
    this.transactionFormError.set(null);
    this.apiMessage.set(`Edition transaction ${tx.id_transaction_str ?? tx.id_transaction}.`);
  }

  cancelTransactionEdit(): void {
    this.editingTransactionId = null;
    this.resetTransactionForm();
  }

  submitTransaction(): void {
    if (!this.hasAccount()) {
      this.transactionFormError.set('Veuillez creer un compte avant de gerer les transactions.');
      return;
    }

    const current = this.account();
    const montant = Number(this.transactionForm.montant);
    const compteDestinationId = Number(this.transactionForm.compteDestinationId || current.id_compte);

    if (!Number.isFinite(montant) || montant <= 0) {
      this.transactionFormError.set('Le montant doit etre superieur a 0.');
      return;
    }

    if (!Number.isInteger(compteDestinationId) || compteDestinationId <= 0) {
      this.transactionFormError.set('Le compte destination est obligatoire.');
      return;
    }

    if (this.editingTransactionId !== null) {
      const editedId = this.editingTransactionId;
      const updatedType = this.mapApiType(this.transactionForm.typeTransaction);
      const updatedStatus = this.mapApiStatus(this.transactionForm.statut);

      this.transactions.update((items) =>
        items.map((item) => {
          if (item.id_transaction !== editedId) {
            return item;
          }

          return {
            ...item,
            type_transaction: updatedType,
            montant,
            statut: updatedStatus,
            id_compte_destination: compteDestinationId,
            date_transaction: new Date()
          };
        })
      );

      if (this.selectedTransaction?.idTransaction === editedId) {
        this.selectedTransaction = {
          ...this.selectedTransaction,
          typeTransaction: this.transactionForm.typeTransaction,
          montant,
          statut: this.transactionForm.statut,
          compteDestinationId
        };
      }

      this.apiMessage.set(`Transaction #${editedId} mise a jour localement.`);
      this.cancelTransactionEdit();
      return;
    }

    const payload: CreateTransactionRequest = {
      typeTransaction: this.transactionForm.typeTransaction,
      montant,
      compteSourceId: current.id_compte,
      compteDestinationId,
      orderId: Number(this.transactionForm.orderId) || Date.now()
    };

    this.loadingApi.set(true);
    this.transactionFormError.set(null);
    this.apiError.set(null);

    this.financeService.createTransactionApi(payload).subscribe({
      next: (tx) => {
        this.apiMessage.set(`Transaction #${tx.idTransaction} creee.`);
        this.selectedTransaction = tx;
        this.editingTransactionId = null;
        this.resetTransactionForm();
        this.loadTransactionsForCompte(current.id_compte);
        this.loadingApi.set(false);
      },
      error: (err) => {
        this.transactionFormError.set(this.extractApiError(err, 'Echec de creation de transaction.'));
        this.loadingApi.set(false);
      }
    });
  }

  deleteTransaction(tx: Transaction): void {
    this.deleteDialog.set({
      open: true,
      entity: 'transaction',
      id: tx.id_transaction,
      title: 'Supprimer la transaction',
      description: `Voulez-vous vraiment supprimer la transaction ${tx.id_transaction_str ?? tx.id_transaction} ?`
    });
  }

  private performDeleteTransaction(tx: Transaction): void {

    this.transactions.update((items) => items.filter((item) => item.id_transaction !== tx.id_transaction));

    if (this.editingTransactionId === tx.id_transaction) {
      this.cancelTransactionEdit();
    }

    if (this.selectedTransaction?.idTransaction === tx.id_transaction) {
      this.selectedTransaction = null;
    }

    this.apiMessage.set(`Transaction ${tx.id_transaction_str ?? tx.id_transaction} supprimee localement.`);
  }

  createAccount(): void {
    if (!this.validateAccountForm()) {
      this.apiError.set('Veuillez corriger les erreurs du formulaire avant de creer le compte.');
      return;
    }

    const userId = this.user().id_utilisateur;
    const initialBalance = Number(this.accountForm.initialBalance || 0);

    if (!userId) {
      this.apiError.set('Utilisateur introuvable pour la creation du compte.');
      return;
    }

    this.loadingApi.set(true);
    this.apiError.set(null);

    this.financeService.createAccountApi({
      solde: initialBalance,
      typeCompte: this.accountForm.typeCompte,
      utilisateurId: userId
    }).subscribe({
      next: (created) => {
        this.financeService.getAccountByIdApi(created.idCompte).subscribe({
          next: (account) => {
            this.applyAccount(account.idCompte, account.solde, account.typeCompte, account.utilisateurId);
            this.loadTransactionsForCompte(account.idCompte);
            this.apiMessage.set('Compte financier cree avec succes.');
            this.loadingApi.set(false);
          },
          error: () => {
            this.applyAccount(created.idCompte, created.solde, created.typeCompte, created.utilisateurId);
            this.loadTransactionsForCompte(created.idCompte);
            this.apiMessage.set('Compte cree (lecture detail indisponible).');
            this.loadingApi.set(false);
          }
        });
      },
      error: () => {
        this.apiError.set('Echec de creation du compte financier.');
        this.loadingApi.set(false);
      }
    });
  }

  updateCurrentBalance(): void {
    if (!this.hasAccount()) {
      this.apiError.set('Aucun compte a mettre a jour.');
      return;
    }

    const current = this.account();
    const input = prompt('Nouveau solde:', String(current.solde));
    if (input === null) {
      return;
    }

    const newBalance = Number(input);
    if (Number.isNaN(newBalance) || newBalance < 0) {
      this.apiError.set('Le solde doit etre un nombre positif ou nul.');
      return;
    }

    this.financeService.updateAccountApi(current.id_compte, {
      solde: newBalance,
      typeCompte: this.accountForm.typeCompte,
      utilisateurId: current.id_utilisateur
    }).subscribe({
      next: (updated) => {
        this.applyAccount(updated.idCompte, updated.solde, updated.typeCompte, updated.utilisateurId);
        this.apiMessage.set(`Solde du compte mis a jour: ${updated.solde}.`);
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Echec de mise a jour du compte.'));
      }
    });
  }

  openDeleteAccountModal(): void {
    if (!this.hasAccount()) {
      this.apiError.set('Aucun compte a supprimer.');
      return;
    }

    const current = this.account();
    this.deleteDialog.set({
      open: true,
      entity: 'account',
      id: current.id_compte,
      title: 'Confirmer la suppression',
      description: 'Cette action supprimera le compte financier ainsi que ses donnees locales affichees. Voulez-vous continuer ?'
    });
  }

  cancelDeleteAccount(): void {
    this.deleteDialog.set({
      open: false,
      entity: null,
      id: null,
      title: '',
      description: ''
    });
  }

  confirmDeleteCurrentAccount(): void {
    const dialog = this.deleteDialog();
    if (!dialog.open || !dialog.entity || dialog.id === null) {
      this.cancelDeleteAccount();
      return;
    }

    const entity = dialog.entity;
    const id = dialog.id;
    this.cancelDeleteAccount();

    if (entity === 'transaction') {
      const tx = this.transactions().find((item) => item.id_transaction === id);
      if (tx) {
        this.performDeleteTransaction(tx);
      }
      return;
    }

    if (entity === 'remboursement') {
      const remboursement = this.remboursementsApi().find((item) => item.idRemboursement === id);
      if (remboursement) {
        this.performDeleteRemboursement(remboursement);
      }
      return;
    }

    if (!this.hasAccount()) {
      return;
    }

    this.performDeleteAccount(id);
  }

  private performDeleteAccount(accountId: number): void {
    this.loadingApi.set(true);
    this.apiError.set(null);

    this.financeService.deleteAccountApi(accountId).subscribe({
      next: () => {
        this.hasAccount.set(false);
        this.transactions.set([]);
        this.remboursementsApi.set([]);
        this.reglesApi.set([]);
        this.accountForm.idFile = null;
        this.selectedTransaction = null;
        this.apiMessage.set('Compte supprime avec succes.');
        this.loadingApi.set(false);
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Echec de suppression du compte.'));
        this.loadingApi.set(false);
      }
    });
  }

  refreshTransactions(): void {
    if (!this.hasAccount()) {
      this.apiError.set('Aucun compte actif pour rafraichir les transactions.');
      return;
    }

    this.loadTransactionsForCompte(this.account().id_compte);
    this.apiMessage.set('Liste des transactions rafraichie.');
  }

  viewTransaction(id: number): void {
    this.financeService.getTransactionByIdApi(id).subscribe({
      next: (tx) => {
        this.selectedTransaction = tx;
        this.apiMessage.set(`Transaction #${tx.idTransaction}: ${tx.typeTransaction} ${tx.montant}`);
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Impossible de charger le detail de la transaction.'));
      }
    });
  }

  loadCreditOperations(): void {
    const creditId = Number(this.selectedCreditId);
    if (!creditId) {
      this.apiError.set('Saisissez un Credit ID valide.');
      return;
    }

    if (!this.isKnownCredit(creditId)) {
      const known = this.availableCredits().map((credit) => credit.id).join(', ');
      this.apiError.set(`Credit inexistant (#${creditId}). Credits disponibles: ${known || 'aucun'}.`);
      return;
    }

    forkJoin({
      remboursements: this.financeService.getRemboursementsByCreditApi(creditId),
      regles: this.financeService.getReglesRemboursementByCreditApi(creditId)
    }).subscribe({
      next: ({ remboursements, regles }) => {
        this.remboursementsApi.set(remboursements);
        this.reglesApi.set(regles);

        if (remboursements.length === 0 && regles.length === 0) {
          this.apiMessage.set(`Aucune operation trouvee pour le credit #${creditId}.`);
        } else {
          this.apiMessage.set(`Operations chargees pour le credit #${creditId}.`);
        }
      },
      error: () => {
        this.apiError.set('Impossible de charger les operations de credit.');
      }
    });
  }

  private resetRemboursementForm(): void {
    this.remboursementForm = {
      creditId: this.selectedCreditId,
      montant: null,
      mode: 'automatique',
      transactionId: null
    };
    this.remboursementFormError.set(null);
  }

  startEditRemboursement(item: RemboursementApi): void {
    this.editingRemboursementId = item.idRemboursement;
    this.remboursementForm = {
      creditId: item.creditId,
      montant: item.montant,
      mode: item.mode || 'automatique',
      transactionId: item.transactionId ?? null
    };
    this.remboursementFormError.set(null);
  }

  cancelRemboursementEdit(): void {
    this.editingRemboursementId = null;
    this.resetRemboursementForm();
  }

  submitRemboursement(): void {
    const creditId = Number(this.remboursementForm.creditId);
    const montant = Number(this.remboursementForm.montant);
    const transactionId = this.remboursementForm.transactionId ? Number(this.remboursementForm.transactionId) : undefined;

    if (!creditId || !montant || montant <= 0) {
      this.remboursementFormError.set('Remboursement: creditId et montant valides sont obligatoires.');
      return;
    }

    if (!this.isKnownCredit(creditId)) {
      const known = this.availableCredits().map((credit) => credit.id).join(', ');
      this.remboursementFormError.set(`Credit inexistant (#${creditId}). Credits disponibles: ${known || 'aucun'}.`);
      return;
    }

    if (this.editingRemboursementId !== null) {
      const editId = this.editingRemboursementId;
      const mode = this.remboursementForm.mode || 'automatique';

      this.remboursementsApi.update((items) =>
        items.map((item) =>
          item.idRemboursement === editId
            ? {
                ...item,
                creditId,
                montant,
                mode,
                transactionId
              }
            : item
        )
      );

      this.apiMessage.set(`Remboursement #${editId} mis a jour localement.`);
      this.cancelRemboursementEdit();
      return;
    }

    const payload: CreateRemboursementRequest = {
      creditId,
      montant,
      mode: this.remboursementForm.mode || 'automatique',
      transactionId
    };

    this.loadingApi.set(true);
    this.remboursementFormError.set(null);

    this.financeService.createRemboursementApi(payload).subscribe({
      next: (created) => {
        this.remboursementsApi.update((items) => [created, ...items]);
        this.viewRemboursement(created.idRemboursement);
        this.resetRemboursementForm();
        this.loadingApi.set(false);
      },
      error: (err) => {
        this.remboursementFormError.set(this.extractApiError(err, 'Echec de creation du remboursement.'));
        this.loadingApi.set(false);
      }
    });
  }

  deleteRemboursement(item: RemboursementApi): void {
    this.deleteDialog.set({
      open: true,
      entity: 'remboursement',
      id: item.idRemboursement,
      title: 'Supprimer le remboursement',
      description: `Voulez-vous vraiment supprimer le remboursement #${item.idRemboursement} ?`
    });
  }

  private performDeleteRemboursement(item: RemboursementApi): void {

    this.remboursementsApi.update((items) =>
      items.filter((entry) => entry.idRemboursement !== item.idRemboursement)
    );

    if (this.editingRemboursementId === item.idRemboursement) {
      this.cancelRemboursementEdit();
    }

    this.apiMessage.set(`Remboursement #${item.idRemboursement} supprime localement.`);
  }

  viewRemboursement(id: number): void {
    this.financeService.getRemboursementByIdApi(id).subscribe({
      next: (item) => {
        this.apiMessage.set(`Remboursement #${item.idRemboursement}: ${item.montant}`);
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Impossible de charger le detail du remboursement.'));
      }
    });
  }

  createRegle(): void {
    const creditId = Number(this.regleForm.creditId);
    const valeur = Number(this.regleForm.valeur);
    if (!creditId || !valeur || valeur <= 0) {
      this.apiError.set('Regle: creditId et valeur valides sont obligatoires.');
      return;
    }

    if (!this.isKnownCredit(creditId)) {
      const known = this.availableCredits().map((credit) => credit.id).join(', ');
      this.apiError.set(`Credit inexistant (#${creditId}). Credits disponibles: ${known || 'aucun'}.`);
      return;
    }

    const payload: CreateRegleRemboursementRequest = {
      creditId,
      typeRegle: this.regleForm.typeRegle,
      valeur
    };

    this.financeService.createRegleRemboursementApi(payload).subscribe({
      next: (created) => {
        this.viewRegle(created.idRegle);
        this.loadCreditOperations();
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Echec de creation de la regle.'));
      }
    });
  }

  viewRegle(id: number): void {
    this.financeService.getRegleRemboursementByIdApi(id).subscribe({
      next: (regle) => {
        this.apiMessage.set(`Regle #${regle.idRegle}: ${regle.typeRegle} (${regle.valeur})`);
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Impossible de charger le detail de la regle.'));
      }
    });
  }

  updateRegle(regle: RegleRemboursementApi): void {
    const input = prompt('Nouvelle valeur de regle:', String(regle.valeur));
    if (input === null) {
      return;
    }

    const valeur = Number(input);
    if (Number.isNaN(valeur) || valeur <= 0) {
      this.apiError.set('Valeur de regle invalide.');
      return;
    }

    this.financeService.updateRegleRemboursementApi(regle.idRegle, {
      creditId: regle.creditId,
      typeRegle: regle.typeRegle,
      valeur
    }).subscribe({
      next: () => {
        this.apiMessage.set('Regle mise a jour.');
        this.loadCreditOperations();
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Echec de mise a jour de la regle.'));
      }
    });
  }

  deleteRegle(regle: RegleRemboursementApi): void {
    const confirmed = confirm(`Supprimer la regle #${regle.idRegle} ?`);
    if (!confirmed) {
      return;
    }

    this.financeService.deleteRegleRemboursementApi(regle.idRegle).subscribe({
      next: () => {
        this.apiMessage.set('Regle supprimee.');
        this.loadCreditOperations();
      },
      error: (err) => {
        this.apiError.set(this.extractApiError(err, 'Echec de suppression de la regle.'));
      }
    });
  }

  chooseCredit(creditId: number): void {
    this.selectedCreditId = creditId;
    this.remboursementForm.creditId = creditId;
    this.regleForm.creditId = creditId;
    this.apiMessage.set(`Credit #${creditId} selectionne.`);
  }

  private isKnownCredit(creditId: number): boolean {
    const knownCredits = this.availableCredits();

    // If list is unavailable, keep backend as source of truth.
    if (knownCredits.length === 0) {
      return true;
    }

    return knownCredits.some((credit) => credit.id === creditId);
  }
}