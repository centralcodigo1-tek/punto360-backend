import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('categories')
export class CategoriesController {

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@ActiveUser() user: ActiveUserData) {
    return this.categoriesService.findAll(user);
  }

  @Post()
  create(@Body('name') name: string, @ActiveUser() user: ActiveUserData) {
    return this.categoriesService.create(name, user);
  }
}
