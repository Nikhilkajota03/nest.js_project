import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto,SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from 'src/utils/constants';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}



   //signup in service -------------------------------------------------------------------------

   async signup(dto: SignupDto) {
    const { email, password, walletAddress } = dto;

    // Check if user with provided email already exists
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
  
    // Hash the password
    const hashedPassword = await this.hashPassword(password);
  
    // Create a new user with email and hashed password
    const newUser = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  
    // Create a wallet address for the user
    await this.prisma.walletAddress.create({
      data: {
        address: walletAddress,
        user: {
          connect: {
            id: newUser.id,
          },
        },
      },
    });
  
    // Return success message
    return { message: 'User created successfully' };
  }








   //signin service -------------------------------------------------------------------------


  async signin(dto: AuthDto, req: Request, res: Response) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      throw new BadRequestException('Wrong credentials');
    }

    const compareSuccess = await this.comparePasswords({
      password,
      hash: foundUser.hashedPassword,
    });

    if (!compareSuccess) {
      throw new BadRequestException('Wrong credentials');
    }

    const token = await this.signToken({
      userId: foundUser.id,
      email: foundUser.email,
    });

    if (!token) {
      throw new ForbiddenException('Could not signin');
    }

    res.cookie('token', token, {});

    return res.send({ message: 'Logged in succefully' });
  }



   //signout service -------------------------------------------------------------------------


  async signout(req: Request, res: Response) {
    res.clearCookie('token');

    return res.send({ message: 'Logged out succefully' });
  }

 

   //hash password service -------------------------------------------------------------------------


  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }


   //comparePasswords service -------------------------------------------------------------------------

  async comparePasswords(args: { hash: string; password: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }


 //signToken service -------------------------------------------------------------------------

  async signToken(args: { userId: string; email: string }) {
    const payload = {
      id: args.userId,
      email: args.email,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: jwtSecret,
    });

    return token;
  }







}
