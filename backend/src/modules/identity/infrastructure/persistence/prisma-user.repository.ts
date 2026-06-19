import { Injectable } from '@nestjs/common';
import { Prisma, User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateRefreshTokenData,
  CreateUserData,
  RefreshTokenRecord,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { googleId },
    });

    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prismaService.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        googleId: data.googleId,
        role: data.role as PrismaUserRole,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    return this.toDomain(user);
  }

  async createRefreshToken(
    data: CreateRefreshTokenData,
  ): Promise<RefreshTokenRecord> {
    return this.prismaService.refreshToken.create({ data });
  }

  async findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    return this.prismaService.refreshToken.findFirst({
      where: { tokenHash },
    });
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({ where: { id } });
  }

  async deleteExpiredRefreshTokens(userId: string, now: Date): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: now },
      },
    });
  }

  private toDomain(user: PrismaUser): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      googleId: user.googleId,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
