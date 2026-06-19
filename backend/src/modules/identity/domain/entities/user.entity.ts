import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export interface UserProps {
  id: string;
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string | null | undefined {
    return this.props.passwordHash;
  }

  get googleId(): string | null | undefined {
    return this.props.googleId;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...publicProps } = this.props;

    return publicProps;
  }
}
