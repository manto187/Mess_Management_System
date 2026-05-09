import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto, MealQueryDto } from './dto/meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  findAll(@Query() query: MealQueryDto) { return this.mealsService.findAll(query); }

  @Post()
  create(@Body() dto: CreateMealDto) { return this.mealsService.create(dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.mealsService.remove(id); }
}
