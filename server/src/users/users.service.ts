import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne() {
    return { id: 1, username: 'dummy' };
  }
}
