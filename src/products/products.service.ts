import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ImportProductsDto } from './dto/import-products.dto';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductDto, user: ActiveUserData) {
        return this.prisma.$transaction(async (tx) => {

            // 1️⃣ Crear producto
            const product = await tx.products.create({
                data: {
                    name: dto.name,
                    sku: dto.sku,
                    category_id: dto.category_id,
                    cost_price: dto.cost_price,
                    sale_price: dto.sale_price,
                    unit_type: dto.unit_type || 'UNIT',
                    is_active: dto.is_active,
                    is_consignment: dto.is_consignment ?? false,
                    company_id: user.companyId,
                },
            });

            // 2️⃣ Crear stock inicial en la sucursal del usuario
            await tx.stock.create({
                data: {
                    product_id: product.id,
                    branch_id: user.branchIds[0],
                    quantity: dto.stock,
                },
            });

            return product;
        });
    }


    async getNextSku(user: ActiveUserData) {
        const branch = await this.prisma.branches.findUnique({
            where: { id: user.branchIds[0] },
        });

        if (!branch) {
            throw new Error('Sucursal no encontrada');
        }
        console.log(branch)
        const branchCode = branch.code || 'MAIN';

        const productsWithSku = await this.prisma.products.findMany({
            where: {
                company_id: user.companyId,
                sku: { startsWith: branchCode },
            },
            select: { sku: true },
        });

        let nextNumber = 1;

        if (productsWithSku.length > 0) {
            const numbers = productsWithSku
                .map(p => parseInt(p.sku.split('-').at(-1) ?? '0', 10))
                .filter(n => !isNaN(n));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }

        const formattedNumber = nextNumber.toString().padStart(4, '0');

        return {
            sku: `${branchCode}-${formattedNumber}`,
        };
    }

    async findAll(user: ActiveUserData) {
        return this.prisma.products.findMany({
            where: {
                company_id: user.companyId,
            },
            include: {
                categories: true,
                stock: {
                    where: {
                        branch_id: { in: user.branchIds }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async toggleStatus(id: string, user: ActiveUserData) {
        const product = await this.prisma.products.findFirst({
            where: {
                id,
                company_id: user.companyId
            }
        });

        if (!product) {
            throw new Error('Producto no encontrado o no pertenece a tu negocio');
        }

        return this.prisma.products.update({
            where: { id },
            data: { is_active: !product.is_active }
        });
    }

    async importProducts(dto: ImportProductsDto, user: ActiveUserData) {
        const branchId = user.branchIds?.[0];
        const created: string[] = [];
        const skipped: string[] = [];
        const errors: { ref: string; reason: string }[] = [];

        // Cache de categorías para no repetir queries
        const categoryCache = new Map<string, string>();

        for (const item of dto.productos) {
            let sku = item.reference?.trim() || '';
            try {
                // Auto-generar SKU si no viene en el XML
                if (!sku) {
                    const next = await this.getNextSku(user);
                    sku = next.sku;
                }

                // Buscar o crear categoría
                const catName = (item.categoria ?? 'General').trim();
                let categoryId = categoryCache.get(catName);

                if (!categoryId) {
                    let cat = await this.prisma.categories.findFirst({
                        where: { company_id: user.companyId, name: { equals: catName, mode: 'insensitive' } },
                    });
                    if (!cat) {
                        cat = await this.prisma.categories.create({
                            data: { company_id: user.companyId, name: catName },
                        });
                    }
                    categoryId = cat.id;
                    categoryCache.set(catName, cat.id);
                }

                // Verificar si ya existe el SKU
                const existing = await this.prisma.products.findUnique({
                    where: { company_id_sku: { company_id: user.companyId, sku } },
                });
                if (existing) {
                    skipped.push(sku);
                    continue;
                }

                const unitType = item.tipo_venta === 2 ? 'WEIGHT' : 'UNIT';

                // Crear producto + stock inicial
                const product = await this.prisma.products.create({
                    data: {
                        company_id: user.companyId,
                        category_id: categoryId,
                        name: item.nombre,
                        sku,
                        cost_price: item.precio_compra,
                        sale_price: item.precio_venta,
                        unit_type: unitType,
                        is_active: true,
                        is_consignment: false,
                    },
                });

                await this.prisma.stock.create({
                    data: { product_id: product.id, branch_id: branchId, quantity: item.stock },
                });

                created.push(sku);
            } catch (e: any) {
                errors.push({ ref: sku || item.nombre, reason: e?.message ?? 'Error desconocido' });
            }
        }

        return { created: created.length, skipped: skipped.length, errors, createdRefs: created, skippedRefs: skipped };
    }

    async update(id: string, dto: CreateProductDto, user: ActiveUserData) {
        // Ignoramos stock en la actualización general por diseño de POS
        const product = await this.prisma.products.findFirst({
            where: {
                id,
                company_id: user.companyId
            }
        });

        if (!product) {
            throw new Error('Producto no encontrado o no autorizado');
        }

        return this.prisma.products.update({
            where: { id },
            data: {
                name: dto.name,
                category_id: dto.category_id,
                cost_price: dto.cost_price,
                sale_price: dto.sale_price,
                unit_type: dto.unit_type || 'UNIT',
                is_active: dto.is_active,
                is_consignment: dto.is_consignment ?? false
            }
        });
    }
}
