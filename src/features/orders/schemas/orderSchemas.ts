import { z } from 'zod'
import { ORDER_STATUSES, DATE_PRESETS } from '@/features/orders/types'

export const orderFiltersSchema = z.object({
 companyId: z.string().uuid('Invalid company ID').nullable(),
 locationId: z.string().uuid('Invalid location ID').nullable(),
 dateFrom: z.string().datetime().nullable(),
 dateTo: z.string().datetime().nullable(),
 status: z.array(z.enum(ORDER_STATUSES)),
 datePreset: z.enum(DATE_PRESETS).optional(),
})

export type OrderFiltersFormValues = z.infer<typeof orderFiltersSchema>
