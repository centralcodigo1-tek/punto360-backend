import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private parseDates(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Formato de fecha inválido.');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  /** Calcula Ingresos, Costos y Utilidad Bruta en un rango */
  async getFinancialSummary(startDate: string, endDate: string, user: ActiveUserData) {
    if (!user.branchIds || user.branchIds.length === 0) throw new BadRequestException('Sin sucursales asignadas.');

    const { start, end } = this.parseDates(startDate, endDate);

    const sales = await this.prisma.sales.findMany({
      where: {
        company_id: user.companyId,
        branch_id: { in: user.branchIds },
        created_at: { gte: start, lte: end },
        status: 'PAID',
      },
      include: {
        sale_items: {
          include: {
            products: { select: { cost_price: true } },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    for (const sale of sales) {
      totalRevenue += Number(sale.total);
      for (const item of sale.sale_items) {
        const cost = Number(item.products?.cost_price || 0);
        totalCost += cost * Number(item.quantity || 0);
      }
    }

    return {
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      transactionCount: sales.length,
      averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
    };
  }

  /** Obtiene la tendencia de ventas diaria */
  async getSalesTrend(startDate: string, endDate: string, user: ActiveUserData) {
    if (!user.branchIds || user.branchIds.length === 0) throw new BadRequestException('Sin sucursales asignadas.');

    const { start, end } = this.parseDates(startDate, endDate);

    const sales = await this.prisma.sales.findMany({
      where: {
        company_id: user.companyId,
        branch_id: { in: user.branchIds },
        created_at: { gte: start, lte: end },
        status: 'PAID',
      },
      select: { created_at: true, total: true },
      orderBy: { created_at: 'asc' },
    });

    const trendMap = new Map<string, { date: string; revenue: number; transactions: number }>();

    sales.forEach(s => {
      // Usar fecha local para el agrupamiento en el gráfico
      const d = s.created_at!;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const existing = trendMap.get(dateKey) || { date: dateKey, revenue: 0, transactions: 0 };
      existing.revenue += Number(s.total);
      existing.transactions += 1;
      trendMap.set(dateKey, existing);
    });

    return Array.from(trendMap.values());
  }

  /** Productos más vendidos */
  async getTopProducts(startDate: string, endDate: string, user: ActiveUserData, limit = 10) {
    if (!user.branchIds || user.branchIds.length === 0) throw new BadRequestException('Sin sucursales asignadas.');

    const { start, end } = this.parseDates(startDate, endDate);

    const items = await this.prisma.sale_items.findMany({
      where: {
        sales: {
          company_id: user.companyId,
          branch_id: { in: user.branchIds },
          created_at: { gte: start, lte: end },
          status: 'PAID',
        },
      },
      include: {
        products: { select: { name: true, sku: true } },
      },
    });

    const productMap = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();

    items.forEach(item => {
      const id = item.product_id!;
      if (!item.products) return;
      
      const existing = productMap.get(id) || { name: item.products.name, sku: item.products.sku, quantity: 0, revenue: 0 };
      existing.quantity += Number(item.quantity || 0);
      existing.revenue += Number(item.subtotal || 0);
      productMap.set(id, existing);
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /** Ventas por categoría */
  async getCategoryStats(startDate: string, endDate: string, user: ActiveUserData) {
    if (!user.branchIds || user.branchIds.length === 0) throw new BadRequestException('Sin sucursales asignadas.');

    const { start, end } = this.parseDates(startDate, endDate);

    const items = await this.prisma.sale_items.findMany({
      where: {
        sales: {
          company_id: user.companyId,
          branch_id: { in: user.branchIds },
          created_at: { gte: start, lte: end },
          status: 'PAID',
        },
      },
      include: {
        products: {
            include: { categories: { select: { name: true } } }
        },
      },
    });

    const categoryMap = new Map<string, { category: string; revenue: number; quantity: number }>();

    items.forEach(item => {
      const catName = item.products?.categories?.name || 'Varios';
      const existing = categoryMap.get(catName) || { category: catName, revenue: 0, quantity: 0 };
      existing.revenue += Number(item.subtotal || 0);
      existing.quantity += Number(item.quantity || 0);
      categoryMap.set(catName, existing);
    });

    return Array.from(categoryMap.values());
  }
}
