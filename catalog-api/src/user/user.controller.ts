import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  /**
   * Note: The 'create' method is intentionally omitted from this controller 
   * as user registration is handled by the AuthService.register(dto) flow 
   * to ensure security and proper JWT emission upon account creation.
   */
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
