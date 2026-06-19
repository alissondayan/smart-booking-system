export interface BlockedTimeProps {
  id: string;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
  createdAt: Date;
}

export class BlockedTimeEntity {
  constructor(private readonly props: BlockedTimeProps) {}

  toJSON(): BlockedTimeProps {
    return { ...this.props };
  }
}
