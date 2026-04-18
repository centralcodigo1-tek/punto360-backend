import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

export interface AppNotification {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(user: ActiveUserData) {
    const notifications: AppNotification[] = [];

    if (!user.branchIds || user.branchIds.length === 0) {
      return { count: 0, notifications: [] };
    }

    const [lowStockItems, openCashRegisters, pendingPurchases] = await Promise.all([
      this.prisma.stock.findMany({
        where: { branch_id: { in: user.branchIds }, quantity: { lt: 5 } },
        include: {
          products: { select: { name: true, sku: true } },
          branches: { select: { name: true } },
        },
      }),
      this.prisma.cash_registers.findMany({
        where: {
          branch_id: { in: user.branchIds },
          status: 'OPEN',
          opened_at: { lt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
        },
        include: { branches: { select: { name: true } } },
      }),
      this.prisma.purchases.findMany({
        where: {
          branch_id: { in: user.branchIds },
          status: { not: 'PAID' },
          due_date: { lte: new Date() },
        },
        include: { suppliers: { select: { name: true } } },
        take: 5,
      }),
    ]);

    for (const stock of lowStockItems) {
      if (!stock.products) continue;
      const qty = stock.quantity.toNumber();
      notifications.push({
        id: `low-stock-${stock.id}`,
        type: qty === 0 ? 'danger' : 'warning',
        title: qty === 0 ? 'Sin stock' : 'Stock crítico',
        message: `${stock.products.name} (${stock.branches?.name ?? ''}) — ${qty} uds.`,
        createdAt: stock.updated_at ?? new Date(),
      });
    }

    for (const register of openCashRegisters) {
      const hoursOpen = Math.floor(
        (Date.now() - (register.opened_at?.getTime() ?? 0)) / (1000 * 60 * 60),
      );
      notifications.push({
        id: `cash-${register.id}`,
        type: 'warning',
        title: 'Caja abierta',
        message: `"${register.name ?? register.branches?.name}" lleva ${hoursOpen}h sin cerrar`,
        createdAt: register.opened_at ?? new Date(),
      });
    }

    for (const purchase of pendingPurchases) {
      notifications.push({
        id: `purchase-${purchase.id}`,
        type: 'danger',
        title: 'Compra vencida',
        message: `Deuda con ${purchase.suppliers?.name ?? 'proveedor'} — $${Number(purchase.total).toLocaleString('es-CO')}`,
        createdAt: purchase.due_date ?? new Date(),
      });
    }

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { count: notifications.length, notifications };
  }
}
