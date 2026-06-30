import { Module } from '@nestjs/common';
import { PushTokenController } from './push-token.controller';
import { PushTokenService } from './push-token.service';

@Module({
  controllers: [PushTokenController],
  providers: [PushTokenService],
})
export class PushTokenModule {}
