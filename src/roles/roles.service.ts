import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';

// Permisos base del sistema — fuente de verdad
const BASE_PERMISSIONS = [
    { key: 'dashboard.view',    name: 'Ver Dashboard' },
    { key: 'pos.access',        name: 'Acceso a Terminal de Ventas' },
    { key: 'cash.manage',       name: 'Gestionar Arqueos de Caja' },
    { key: 'inventory.manage',  name: 'Gestionar Inventario y Productos' },
    { key: 'purchases.manage',  name: 'Registrar Compras / Recepciones' },
    { key: 'history.view',      name: 'Ver Historial de Ventas' },
    { key: 'sales.cancel',      name: 'Anular Ventas' },
    { key: 'users.manage',      name: 'Administrar Usuarios y Roles' },
    { key: 'reports.view',      name: 'Ver Reportes y Analíticas' },
    { key: 'customers.manage',  name: 'Gestionar Clientes y Créditos' },
];

// Definición de roles y sus permisos exactos
const DEFAULT_ROLES = [
    {
        name: 'ADMIN',
        permissions: [
            'dashboard.view', 'pos.access', 'cash.manage', 'inventory.manage',
            'purchases.manage', 'history.view', 'sales.cancel', 'users.manage',
            'reports.view', 'customers.manage',
        ],
    },
    {
        name: 'SUPERVISOR',
        permissions: [
            'dashboard.view', 'pos.access', 'cash.manage', 'inventory.manage',
            'purchases.manage', 'history.view', 'sales.cancel', 'reports.view',
            'customers.manage',
        ],
    },
    {
        name: 'CAJERO',
        permissions: ['pos.access', 'cash.manage', 'history.view'],
    },
];

@Injectable()
export class RolesService implements OnModuleInit {
    constructor(private prisma: PrismaService) {}

    // Empresas cuya sincronización de roles ya se completó en esta sesión del servidor
    private readonly syncedCompanies = new Set<string>();

    /** Al arrancar el servidor: garantiza que existan todos los permisos base */
    async onModuleInit() {
        for (const p of BASE_PERMISSIONS) {
            await this.prisma.permissions.upsert({
                where: { key: p.key },
                update: { name: p.name },
                create: p,
            });
        }
    }

    /** Listar todos los roles de la empresa actual, incluyendo sus permisos */
    async findAll(user: ActiveUserData) {
        if (!this.syncedCompanies.has(user.companyId)) {
            await this.ensureDefaultRoles(user.companyId);
            this.syncedCompanies.add(user.companyId);
        }

        return this.prisma.roles.findMany({
            where: { company_id: user.companyId },
            include: {
                role_permissions: {
                    include: { permissions: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    /** Obtener lista de todos los permisos base del sistema */
    async findAllPermissions() {
        return this.prisma.permissions.findMany({ orderBy: { name: 'asc' } });
    }

    /**
     * Sincronización completa de roles por defecto.
     * - Crea el rol si no existe
     * - Agrega permisos faltantes
     * - Elimina permisos que no deberían estar (ej: si se cambió la definición)
     */
    async ensureDefaultRoles(companyId: string) {
        for (const r of DEFAULT_ROLES) {
            // 1. Encontrar o crear el rol
            let role = await this.prisma.roles.findFirst({
                where: { company_id: companyId, name: r.name },
            });
            if (!role) {
                role = await this.prisma.roles.create({
                    data: { name: r.name, company_id: companyId },
                });
            }

            // 2. Obtener IDs de los permisos deseados
            const desiredPerms = await this.prisma.permissions.findMany({
                where: { key: { in: r.permissions } },
            });
            const desiredIds = new Set(desiredPerms.map(p => p.id));

            // 3. Obtener permisos actuales del rol
            const currentPerms = await this.prisma.role_permissions.findMany({
                where: { role_id: role.id },
            });

            // 4. Quitar los que sobran
            for (const cp of currentPerms) {
                if (!desiredIds.has(cp.permission_id)) {
                    await this.prisma.role_permissions.delete({
                        where: {
                            role_id_permission_id: {
                                role_id: role.id,
                                permission_id: cp.permission_id,
                            },
                        },
                    });
                }
            }

            // 5. Agregar los que faltan (skipDuplicates evita el conflicto en @@id compuesto)
            await this.prisma.role_permissions.createMany({
                data: desiredPerms.map(p => ({ role_id: role.id, permission_id: p.id })),
                skipDuplicates: true,
            });
        }
    }
}
