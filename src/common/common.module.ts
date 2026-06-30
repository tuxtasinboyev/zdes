import { Module } from '@nestjs/common';
import { ConfigModule } from './congif/config.module';

@Module({
  imports: [ConfigModule],
  providers: [],
  exports: [],
})
export class CommonModule {}
