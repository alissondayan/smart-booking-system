export const SLOT_HOLD = Symbol('SLOT_HOLD');

export interface SlotHoldPort {
  acquire(serviceId: string, startAt: Date): Promise<boolean>;
  release(serviceId: string, startAt: Date): Promise<void>;
}
