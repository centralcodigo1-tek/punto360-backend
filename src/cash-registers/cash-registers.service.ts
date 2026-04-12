import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenCashDto, CloseCashDto, AddExpenseDto } from './dto/cash-register.dto';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class CashRegistersService {
    constructor(private prisma: PrismaService) {}

    /** Obtener sesión activa de la sucursal (o null si está cerrada) */
    async getCurrentSession(user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        if (!branchId) throw new BadRequestException('Sin sucursal asignada.');

        return this.prisma.cash_registers.findFirst({
            where: { branch_id: branchId, company_id: user.companyId, status: 'OPEN' },
            include: {
                cash_movements: { orderBy: { created_at: 'desc' } },
                users: { select: { name: true, user_name: true } },
            },
        });
    }

    /** Abrir caja */
    async openSession(dto: OpenCashDto, user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        if (!branchId) throw new BadRequestException('Sin sucursal asignada.');

        // Verificar si ya hay una sesión abierta
        const existing = await this.prisma.cash_registers.findFirst({
            where: { branch_id: branchId, company_id: user.companyId, status: 'OPEN' },
        });
        if (existing) {
            throw new BadRequestException('Ya existe una sesión de caja abierta para esta sucursal.');
        }

        return this.prisma.cash_registers.create({
            data: {
                branch_id: branchId,
                company_id: user.companyId,
                user_id: user.sub,
                name: dto.name || 'Caja Principal',
                status: 'OPEN',
                opening_amount: dto.opening_amount,
                opened_at: new Date(),
            },
        });
    }

    /** Cerrar caja y generar resumen del arqueo */
    async closeSession(sessionId: string, dto: CloseCashDto, user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        if (!branchId) throw new BadRequestException('Sin sucursal asignada.');

        const session = await this.prisma.cash_registers.findFirst({
            where: { id: sessionId, branch_id: branchId, company_id: user.companyId, status: 'OPEN' },
        });
        if (!session) throw new NotFoundException('Sesión de caja no encontrada o ya cerrada.');

        // Calcular ventas del periodo de esta sesión
        const salesInSession = await this.prisma.sales.findMany({
            where: {
                branch_id: branchId,
                company_id: user.companyId,
                status: 'PAID',
                created_at: { gte: session.opened_at! },
            },
            select: { total: true, payment_method: true },
        });

        const cashSales = salesInSession
            .filter(s => s.payment_method === 'CASH')
            .reduce((sum, s) => sum + Number(s.total), 0);

        const cardSales = salesInSession
            .filter(s => s.payment_method === 'CARD')
            .reduce((sum, s) => sum + Number(s.total), 0);

        const transferSales = salesInSession
            .filter(s => s.payment_method === 'TRANSFER')
            .reduce((sum, s) => sum + Number(s.total), 0);

        // Gastos de caja en efectivo del periodo
        const expenses = await this.prisma.cash_movements.findMany({
            where: { cash_register_id: sessionId, type: 'EXPENSE' },
        });
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        const openingAmount = Number(session.opening_amount ?? 0);
        const expectedCash = openingAmount + cashSales - totalExpenses;
        const difference = dto.closing_amount - expectedCash;

        const closed = await this.prisma.cash_registers.update({
            where: { id: sessionId },
            data: {
                status: 'CLOSED',
                closing_amount: dto.closing_amount,
                closed_at: new Date(),
                notes: dto.notes,
            },
        });

        return {
            session: closed,
            summary: {
                openingAmount,
                cashSales,
                cardSales,
                transferSales,
                totalSales: cashSales + cardSales + transferSales,
                totalExpenses,
                expectedCash,
                closingAmount: dto.closing_amount,
                difference,
                ticketsCount: salesInSession.length,
            },
        };
    }

    /** Registrar un gasto de caja */
    async addExpense(sessionId: string, dto: AddExpenseDto, user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        if (!branchId) throw new BadRequestException('Sin sucursal asignada.');

        const session = await this.prisma.cash_registers.findFirst({
            where: { id: sessionId, branch_id: branchId, company_id: user.companyId, status: 'OPEN' },
        });
        if (!session) throw new NotFoundException('Sesión de caja no encontrada o ya cerrada.');

        return this.prisma.cash_movements.create({
            data: {
                cash_register_id: sessionId,
                user_id: user.sub,
                type: 'EXPENSE',
                amount: dto.amount,
                reason: dto.reason,
            },
        });
    }

    /** Historial de sesiones cerradas */
    async getHistory(user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        if (!branchId) throw new BadRequestException('Sin sucursal asignada.');

        return this.prisma.cash_registers.findMany({
            where: { branch_id: branchId, company_id: user.companyId },
            include: {
                users: { select: { name: true, user_name: true } },
                cash_movements: true,
            },
            orderBy: { opened_at: 'desc' },
            take: 20,
        });
    }
}
