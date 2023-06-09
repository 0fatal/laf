import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'
import { BillingTaskService } from './billing-task.service'
import { ApplicationModule } from 'src/application/application.module'
import { ResourceController } from './resource.controller'
import { ResourceTaskService } from './resource-task.service'
import { DatabaseModule } from 'src/database/database.module'
import { RegionModule } from 'src/region/region.module'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [ApplicationModule, DatabaseModule, RegionModule, StorageModule],
  controllers: [BillingController, ResourceController],
  providers: [
    BillingService,
    ResourceService,
    BillingTaskService,
    ResourceTaskService,
  ],
  exports: [BillingService, ResourceService],
})
export class BillingModule {}
