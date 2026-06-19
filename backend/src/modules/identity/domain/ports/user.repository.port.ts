import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  deleteRefreshToken(id: string): Promise<void>;
  deleteExpiredRefreshTokens(userId: string, now: Date): Promise<void>;
}
