import { Controller, Delete, Get, Patch, Param, Req, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  getMyUser(@Param('id') userId: string, @Req() req) {
    return this.usersService.getMyUser(userId, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  deleteUser(@Param('id') userId: string, @Req() req) {
    return this.usersService.deleteProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  updateUserPassword(@Param('id') userId: string, @Body('password') newPassword: string) {
    return this.usersService.updateUserPassword(userId, newPassword);
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }
}
