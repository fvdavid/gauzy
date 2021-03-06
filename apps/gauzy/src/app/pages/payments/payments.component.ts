import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';
import { OnInit, Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PaymentService } from '../../@core/services/payment.service';
import { Store } from '../../@core/services/store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Payment } from '@gauzy/models';
import { OrganizationContactService } from '../../@core/services/organization-contact.service';
import { InvoicePaymentOverdueComponent } from '../invoices/table-components/invoice-payment-overdue.component';

export interface SelectedPayment {
	data: Payment;
	isSelected: false;
}

@Component({
	selector: 'ngx-payments',
	templateUrl: './payments.component.html'
})
export class PaymentsComponent extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	constructor(
		readonly translateService: TranslateService,
		private paymentService: PaymentService,
		private store: Store,
		private organizationContactService: OrganizationContactService
	) {
		super(translateService);
	}

	settingsSmartTable: object;
	smartTableSource = new LocalDataSource();
	selectedPayment: Payment;
	payments: Payment[];
	private _ngDestroy$ = new Subject<void>();

	ngOnInit() {
		this.loadSmartTable();
		this._applyTranslationOnSmartTable();
		this.loadSettings();
	}

	async loadSettings() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(async (org) => {
				if (org) {
					this.selectedPayment = null;
					const { items } = await this.paymentService.getAll(
						['invoice'],
						{
							organizationId: org.id
						}
					);
					this.payments = items;
					const allData = [];
					let data = {};
					for (const item of items) {
						const client = await this.organizationContactService.getById(
							item.invoice.clientId
						);
						data = {
							invoiceNumber: item.invoice.invoiceNumber,
							clientName: client.name,
							amount: item.amount,
							paymentDate: item.paymentDate
								.toString()
								.slice(0, 10),
							recordedBy: item.recordedBy,
							note: item.note,
							overdue: item.overdue
						};
						allData.push(data);
					}
					this.smartTableSource.load(allData);
				}
			});
	}

	loadSmartTable() {
		this.settingsSmartTable = {
			actions: false,
			columns: {
				invoiceNumber: {
					title: this.getTranslation('INVOICES_PAGE.INVOICE_NUMBER'),
					type: 'text',
					filter: false
				},
				clientName: {
					title: this.getTranslation('PAYMENTS_PAGE.CLIENT'),
					type: 'text'
				},
				amount: {
					title: this.getTranslation('PAYMENTS_PAGE.AMOUNT'),
					type: 'text',
					filter: false
				},
				paymentDate: {
					title: this.getTranslation('PAYMENTS_PAGE.PAYMENT_DATE'),
					type: 'text'
				},
				recordedBy: {
					title: this.getTranslation('PAYMENTS_PAGE.RECORDED_BY'),
					type: 'text',
					filter: false
				},
				note: {
					title: this.getTranslation('PAYMENTS_PAGE.NOTE'),
					type: 'text',
					filter: false
				},
				overdue: {
					title: this.getTranslation('PAYMENTS_PAGE.STATUS'),
					type: 'custom',
					renderComponent: InvoicePaymentOverdueComponent
				}
			}
		};
	}

	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange.subscribe(() => {
			this.loadSmartTable();
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
