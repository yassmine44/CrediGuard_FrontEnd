import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  CompteTypeApi,
  CreateFinancialAccountRequest,
  CreateRemboursementRequest,
  CreateTransactionRequest,
  FinanceService,
  FinancialAccountApi,
  RemboursementApi,
  TransactionApi,
  TransactionStatutApi,
  TransactionTypeApi
} from '../../services/finance';

type DeleteEntity = 'account' | 'transaction' | 'remboursement';

interface DeleteDialogState {
  open: boolean;
  entity: DeleteEntity | null;
  id: number | null;
  title: string;
  description: string;
}

@Component({
  selector: 'app-finance-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceAdminComponent implements OnInit {

  private readonly financeService = inject(FinanceService);

  readonly loading = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly accounts = signal<FinancialAccountApi[]>([]);
  readonly transactions = signal<TransactionApi[]>([]);
  readonly remboursements = signal<RemboursementApi[]>([]);

  readonly deleteDialog = signal<DeleteDialogState>({
    open: false,
    entity: null,
    id: null,
    title: '',
    description: ''
  });

  editingAccountId: number | null = null;
  editingTransactionId: number | null = null;
  editingRemboursementId: number | null = null;

  accountForm = {
    solde: null as number | null,
    typeCompte: 'BENEFICIAIRE' as CompteTypeApi,
    utilisateurId: null as number | null
  };

  transactionForm = {
    typeTransaction: 'VENTE' as TransactionTypeApi,
    montant: null as number | null,
    compteSourceId: null as number | null,
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

  ngOnInit(): void {
    this.loadAllFinanceData();
  }

  get totalRevenue(): number {
    return this.transactions().reduce((sum, tx) => sum + tx.montant, 0);
  }

  get pendingTransactionsCount(): number {
    return this.transactions().filter((tx) => tx.statut === 'PENDING').length;
  }

  get totalRemboursementsAmount(): number {
    return this.remboursements().reduce((sum, item) => sum + item.montant, 0);
  }

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
    }

    if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
      return anyErr.message;
    }

    return fallback;
  }

  loadAllFinanceData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);

    forkJoin({
      accounts: this.financeService.getAccountsApi(),
      transactions: this.financeService.getTransactionsApi(),
      remboursements: this.financeService.getRemboursementsApi()
    }).subscribe({
      next: ({ accounts, transactions, remboursements }) => {
        this.accounts.set(accounts);
        this.transactions.set(transactions);
        this.remboursements.set(remboursements);
        this.ensureTransactionAccountDefaults();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractApiError(err, 'Impossible de charger les donnees finance admin.'));
        this.loading.set(false);
      }
    });
  }

  private ensureTransactionAccountDefaults(): void {
    const firstAccountId = this.accounts()[0]?.idCompte;
    if (!firstAccountId) {
      return;
    }

    if (!this.transactionForm.compteSourceId) {
      this.transactionForm.compteSourceId = firstAccountId;
    }

    if (!this.transactionForm.compteDestinationId) {
      this.transactionForm.compteDestinationId = firstAccountId;
    }
  }

  private resetAccountForm(): void {
    this.accountForm = {
      solde: null,
      typeCompte: 'BENEFICIAIRE',
      utilisateurId: null
    };
  }

  startEditAccount(account: FinancialAccountApi): void {
    this.editingAccountId = account.idCompte;
    this.accountForm = {
      solde: account.solde,
      typeCompte: account.typeCompte,
      utilisateurId: account.utilisateurId
    };
  }

  cancelEditAccount(): void {
    this.editingAccountId = null;
    this.resetAccountForm();
  }

  submitAccount(): void {
    const solde = Number(this.accountForm.solde);
    const utilisateurId = Number(this.accountForm.utilisateurId);

    if (!Number.isFinite(solde) || solde < 0) {
      this.error.set('Le solde doit etre un nombre positif ou nul.');
      return;
    }

    if (!Number.isInteger(utilisateurId) || utilisateurId <= 0) {
      this.error.set('L identifiant utilisateur est obligatoire.');
      return;
    }

    const payload: CreateFinancialAccountRequest = {
      solde,
      typeCompte: this.accountForm.typeCompte,
      utilisateurId
    };

    this.loading.set(true);
    this.error.set(null);

    if (this.editingAccountId !== null) {
      const accountId = this.editingAccountId;
      this.financeService.updateAccountApi(accountId, payload).subscribe({
        next: (updated) => {
          this.accounts.update((items) =>
            items.map((item) => (item.idCompte === accountId ? updated : item))
          );
          this.message.set(`Compte #${accountId} mis a jour.`);
          this.cancelEditAccount();
          this.ensureTransactionAccountDefaults();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.extractApiError(err, 'Echec de mise a jour du compte.'));
          this.loading.set(false);
        }
      });
      return;
    }

    this.financeService.createAccountApi(payload).subscribe({
      next: (created) => {
        this.accounts.update((items) => [created, ...items]);
        this.message.set(`Compte #${created.idCompte} cree.`);
        this.resetAccountForm();
        this.ensureTransactionAccountDefaults();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractApiError(err, 'Echec de creation du compte.'));
        this.loading.set(false);
      }
    });
  }

  requestDeleteAccount(account: FinancialAccountApi): void {
    this.deleteDialog.set({
      open: true,
      entity: 'account',
      id: account.idCompte,
      title: 'Supprimer le compte financier',
      description: `Voulez-vous vraiment supprimer le compte #${account.idCompte} ? Cette action est irreversible.`
    });
  }

  private performDeleteAccount(account: FinancialAccountApi): void {
    this.loading.set(true);
    this.error.set(null);

    this.financeService.deleteAccountApi(account.idCompte).subscribe({
      next: () => {
        this.accounts.update((items) => items.filter((item) => item.idCompte !== account.idCompte));
        this.transactions.update((items) =>
          items.filter(
            (tx) => tx.compteSourceId !== account.idCompte && tx.compteDestinationId !== account.idCompte
          )
        );

        if (this.editingAccountId === account.idCompte) {
          this.cancelEditAccount();
        }

        this.message.set(`Compte #${account.idCompte} supprime.`);
        this.ensureTransactionAccountDefaults();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractApiError(err, 'Echec de suppression du compte.'));
        this.loading.set(false);
      }
    });
  }

  private resetTransactionForm(): void {
    const firstAccountId = this.accounts()[0]?.idCompte ?? null;

    this.transactionForm = {
      typeTransaction: 'VENTE',
      montant: null,
      compteSourceId: firstAccountId,
      compteDestinationId: firstAccountId,
      orderId: null,
      statut: 'COMPLETED'
    };
  }

  startEditTransaction(tx: TransactionApi): void {
    this.editingTransactionId = tx.idTransaction;
    this.transactionForm = {
      typeTransaction: tx.typeTransaction,
      montant: tx.montant,
      compteSourceId: tx.compteSourceId,
      compteDestinationId: tx.compteDestinationId,
      orderId: tx.orderId,
      statut: tx.statut
    };
  }

  cancelEditTransaction(): void {
    this.editingTransactionId = null;
    this.resetTransactionForm();
  }

  submitTransaction(): void {
    const montant = Number(this.transactionForm.montant);
    const compteSourceId = Number(this.transactionForm.compteSourceId);
    const compteDestinationId = Number(this.transactionForm.compteDestinationId);

    if (!Number.isFinite(montant) || montant <= 0) {
      this.error.set('Le montant de transaction doit etre superieur a 0.');
      return;
    }

    if (!Number.isInteger(compteSourceId) || compteSourceId <= 0) {
      this.error.set('Le compte source est obligatoire.');
      return;
    }

    if (!Number.isInteger(compteDestinationId) || compteDestinationId <= 0) {
      this.error.set('Le compte destination est obligatoire.');
      return;
    }

    if (this.editingTransactionId !== null) {
      const txId = this.editingTransactionId;

      this.transactions.update((items) =>
        items.map((item) =>
          item.idTransaction === txId
            ? {
                ...item,
                typeTransaction: this.transactionForm.typeTransaction,
                montant,
                compteSourceId,
                compteDestinationId,
                orderId: Number(this.transactionForm.orderId) || item.orderId,
                statut: this.transactionForm.statut,
                dateTransaction: new Date().toISOString()
              }
            : item
        )
      );

      this.message.set(`Transaction #${txId} mise a jour localement.`);
      this.cancelEditTransaction();
      return;
    }

    const payload: CreateTransactionRequest = {
      typeTransaction: this.transactionForm.typeTransaction,
      montant,
      compteSourceId,
      compteDestinationId,
      orderId: Number(this.transactionForm.orderId) || Date.now()
    };

    this.loading.set(true);
    this.error.set(null);

    this.financeService.createTransactionApi(payload).subscribe({
      next: (created) => {
        this.transactions.update((items) => [created, ...items]);
        this.message.set(`Transaction #${created.idTransaction} creee.`);
        this.resetTransactionForm();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractApiError(err, 'Echec de creation de transaction.'));
        this.loading.set(false);
      }
    });
  }

  requestDeleteTransaction(tx: TransactionApi): void {
    this.deleteDialog.set({
      open: true,
      entity: 'transaction',
      id: tx.idTransaction,
      title: 'Supprimer la transaction',
      description: `Voulez-vous vraiment supprimer la transaction #${tx.idTransaction} ?`
    });
  }

  private performDeleteTransaction(tx: TransactionApi): void {
    this.transactions.update((items) => items.filter((item) => item.idTransaction !== tx.idTransaction));

    if (this.editingTransactionId === tx.idTransaction) {
      this.cancelEditTransaction();
    }

    this.message.set(`Transaction #${tx.idTransaction} supprimee localement.`);
  }

  private resetRemboursementForm(): void {
    this.remboursementForm = {
      creditId: null,
      montant: null,
      mode: 'automatique',
      transactionId: null
    };
  }

  startEditRemboursement(item: RemboursementApi): void {
    this.editingRemboursementId = item.idRemboursement;
    this.remboursementForm = {
      creditId: item.creditId,
      montant: item.montant,
      mode: item.mode,
      transactionId: item.transactionId ?? null
    };
  }

  cancelEditRemboursement(): void {
    this.editingRemboursementId = null;
    this.resetRemboursementForm();
  }

  submitRemboursement(): void {
    const creditId = Number(this.remboursementForm.creditId);
    const montant = Number(this.remboursementForm.montant);
    const transactionId = this.remboursementForm.transactionId
      ? Number(this.remboursementForm.transactionId)
      : undefined;

    if (!Number.isInteger(creditId) || creditId <= 0) {
      this.error.set('Le credit ID est obligatoire.');
      return;
    }

    if (!Number.isFinite(montant) || montant <= 0) {
      this.error.set('Le montant de remboursement doit etre superieur a 0.');
      return;
    }

    if (this.editingRemboursementId !== null) {
      const remboursementId = this.editingRemboursementId;
      this.remboursements.update((items) =>
        items.map((item) =>
          item.idRemboursement === remboursementId
            ? {
                ...item,
                creditId,
                montant,
                mode: this.remboursementForm.mode || 'automatique',
                transactionId
              }
            : item
        )
      );

      this.message.set(`Remboursement #${remboursementId} mis a jour localement.`);
      this.cancelEditRemboursement();
      return;
    }

    const payload: CreateRemboursementRequest = {
      creditId,
      montant,
      mode: this.remboursementForm.mode || 'automatique',
      transactionId
    };

    this.loading.set(true);
    this.error.set(null);

    this.financeService.createRemboursementApi(payload).subscribe({
      next: (created) => {
        this.remboursements.update((items) => [created, ...items]);
        this.message.set(`Remboursement #${created.idRemboursement} cree.`);
        this.resetRemboursementForm();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractApiError(err, 'Echec de creation du remboursement.'));
        this.loading.set(false);
      }
    });
  }

  requestDeleteRemboursement(item: RemboursementApi): void {
    this.deleteDialog.set({
      open: true,
      entity: 'remboursement',
      id: item.idRemboursement,
      title: 'Supprimer le remboursement',
      description: `Voulez-vous vraiment supprimer le remboursement #${item.idRemboursement} ?`
    });
  }

  private performDeleteRemboursement(item: RemboursementApi): void {
    this.remboursements.update((items) =>
      items.filter((entry) => entry.idRemboursement !== item.idRemboursement)
    );

    if (this.editingRemboursementId === item.idRemboursement) {
      this.cancelEditRemboursement();
    }

    this.message.set(`Remboursement #${item.idRemboursement} supprime localement.`);
  }

  cancelDeleteDialog(): void {
    this.deleteDialog.set({
      open: false,
      entity: null,
      id: null,
      title: '',
      description: ''
    });
  }

  confirmDeleteDialog(): void {
    const dialog = this.deleteDialog();

    if (!dialog.open || !dialog.entity || dialog.id === null) {
      this.cancelDeleteDialog();
      return;
    }

    const entity = dialog.entity;
    const id = dialog.id;

    this.cancelDeleteDialog();

    if (entity === 'account') {
      const account = this.accounts().find((item) => item.idCompte === id);
      if (account) {
        this.performDeleteAccount(account);
      }
      return;
    }

    if (entity === 'transaction') {
      const transaction = this.transactions().find((item) => item.idTransaction === id);
      if (transaction) {
        this.performDeleteTransaction(transaction);
      }
      return;
    }

    const remboursement = this.remboursements().find((item) => item.idRemboursement === id);
    if (remboursement) {
      this.performDeleteRemboursement(remboursement);
    }
  }
}