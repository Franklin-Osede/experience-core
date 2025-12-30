export enum TransactionType {
  DEPOSIT = 'DEPOSIT', // Incoming money (e.g. from Stripe)
  ESCROW_HOLD = 'ESCROW_HOLD', // Money held safely
  RELEASE = 'RELEASE', // Money released to user wallet
  PAYOUT = 'PAYOUT', // Money sent to bank account
  FEE = 'FEE', // Platform fee deduction
}
