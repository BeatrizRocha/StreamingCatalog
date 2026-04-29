import { Module } from '@nestjs/common';
import { UserContentService } from './user-content.service';
import { UserContentController } from './user-content.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserContentController],
  providers: [UserContentService],
  exports: [UserContentService],
})
export class UserContentModule {}
