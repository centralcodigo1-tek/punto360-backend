import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    @Public()
    @Post('onboard')
    @HttpCode(HttpStatus.CREATED)
    async onboardTenant(@Body() createTenantDto: CreateTenantDto) {
        return this.companiesService.registerTenant(createTenantDto);
    }
}
