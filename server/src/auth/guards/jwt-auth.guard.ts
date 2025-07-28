import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Development mode bypass
    const isDev = process.env.NODE_ENV !== 'production';
    const bypassAuth = isDev && process.env.BYPASS_AUTH === 'true';

    if (bypassAuth) {
      const request = context.switchToHttp().getRequest();
      // Create a mock user with admin privileges for development
      request.user = {
        id: 'dev-user',
        username: 'developer',
        role: 'ADMIN',
      };
      return true;
    }

    return super.canActivate(context);
  }
}
