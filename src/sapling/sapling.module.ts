import { Module } from '@nestjs/common';
import { SaplingService } from './sapling.service';

@Module({
  providers: [SaplingService],
  exports: [SaplingService],
})
export class SaplingModule {}
