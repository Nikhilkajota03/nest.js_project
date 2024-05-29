import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyUser(id: string, req: Request) {
    const decodedUserInfo = req.user as { id: string; email: string };

    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) {
      throw new NotFoundException();
    }

    if (foundUser.id !== decodedUserInfo.id) {
      throw new ForbiddenException();
    }

    delete foundUser.hashedPassword;

    return { user: foundUser };
  }

    async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        walletAddress: {
          select: {
            address: true,
          },
        },
      },
    });
  
    return { users };
  }

  async deleteProfile(userId: string) {
    console.log(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.walletAddress.deleteMany({
      where: { userId },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log(user)
    

    if (!user) {
      throw new NotFoundException('User not found');
    }

    

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    return { message: 'User password updated successfully' };
  }




  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
}
