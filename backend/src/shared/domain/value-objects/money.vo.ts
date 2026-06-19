export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string = 'ILS',
  ) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Money amount must be a non-negative number');
    }
  }
}
