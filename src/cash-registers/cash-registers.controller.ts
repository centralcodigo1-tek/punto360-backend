import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { OpenCashDto, CloseCashDto, AddExpenseDto } from './dto/cash-register.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Controller('cash-registers')
export class CashRegistersController {
    constructor(private readonly cashRegistersService: CashRegistersService) {}

    @Get('current')
    getCurrent(@ActiveUser() user: ActiveUserData) {
        return this.cashRegistersService.getCurrentSession(user);
    }

    @Get('history')
    getHistory(@ActiveUser() user: ActiveUserData) {
        return this.cashRegistersService.getHistory(user);
    }

    @Post('open')
    open(@Body() dto: OpenCashDto, @ActiveUser() user: ActiveUserData) {
        return this.cashRegistersService.openSession(dto, user);
    }

    @Post(':id/close')
    close(
        @Param('id') id: string,
        @Body() dto: CloseCashDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.cashRegistersService.closeSession(id, dto, user);
    }

    @Post(':id/expenses')
    addExpense(
        @Param('id') id: string,
        @Body() dto: AddExpenseDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.cashRegistersService.addExpense(id, dto, user);
    }
}
