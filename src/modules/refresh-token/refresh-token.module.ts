import { Module } from '@nestjs/common';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
})
export class RefreshTokenModule {}
