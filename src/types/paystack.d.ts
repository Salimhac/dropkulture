declare module '@paystack/inline-js' {
  export interface PaystackTransactionConfig {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer' | 'apple_pay'>;
    metadata?: Record<string, any>;
    subaccount?: string;
    bearer?: string;
    onSuccess?: (transaction: any) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
  }

  export default class PaystackPop {
    constructor();
    newTransaction(options: PaystackTransactionConfig): void;
    resumeTransaction(accessCode: string): void;
  }
}
