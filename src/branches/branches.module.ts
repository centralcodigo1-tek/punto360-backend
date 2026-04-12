import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BranchesService],
  controllers: [BranchesController],
  exports: [BranchesService]
})
export class BranchesModule {}
