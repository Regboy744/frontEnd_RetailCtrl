<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { DatePreset } from '@/lib/utils/datePresets'
import type { UserRole } from '@/stores/auth'
import type {
 CompanyOption,
 DashboardFilters as DashboardFiltersType,
 LocationOption,
} from '@/features/dashboard/types'
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-picker'
import { FieldError } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
 Building2,
 Calendar,
 Filter,
 MapPin,
 RefreshCcw,
} from 'lucide-vue-next'

interface Props {
 role: UserRole | null
 filters: DashboardFiltersType
 companies: CompanyOption[]
 locations: LocationOption[]
 isLoadingCompanies?: boolean
 isLoadingLocations?: boolean
 dateError?: string | null
}

interface Emits {
 (e: 'update:filters', filters: Partial<DashboardFiltersType>): void
 (e: 'applyPreset', preset: DatePreset): void
 (e: 'reset'): void
 (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
 isLoadingCompanies: false,
 isLoadingLocations: false,
 dateError: null,
})

const emit = defineEmits<Emits>()

const datePresets = [
 { value: 'today', label: 'Today' },
 { value: 'week', label: 'This Week' },
 { value: 'month', label: 'This Month' },
 { value: 'lastMonth', label: 'Last Month' },
 { value: 'custom', label: 'Custom Range' },
] as const

const showCompanySelect = computed(() => props.role === 'master')
const showLocationSelect = computed(() =>
 ['master', 'admin'].includes(props.role ?? ''),
)

const isLocationDisabled = computed(() => {
 if (!showLocationSelect.value) return true
 if (props.isLoadingLocations) return true
 if (props.role === 'master' && !props.filters.companyId) return true
 return false
})

const isCustomDateRange = computed(() => props.filters.datePreset === 'custom')

const hasActiveFilters = computed(() => {
 return (
  props.filters.companyId !== null ||
  props.filters.locationId !== null ||
  props.filters.dateFrom !== null ||
  props.filters.dateTo !== null
 )
})

const handleCompanyChange = (value: unknown) => {
 const companyId = value && String(value) !== 'none' ? String(value) : null
 emit('update:filters', { companyId, locationId: null })
}

const handleLocationChange = (value: unknown) => {
 const locationId = value && String(value) !== 'all' ? String(value) : null
 emit('update:filters', { locationId })
}

const handleDatePresetChange = (value: unknown) => {
 if (!value) return
 emit('applyPreset', String(value) as DatePreset)
}

const updateDateFrom = (value: string | null) => {
 emit('update:filters', {
  dateFrom: value || null,
  datePreset: 'custom',
 })
}

const updateDateTo = (value: string | null) => {
 emit('update:filters', {
  dateTo: value || null,
  datePreset: 'custom',
 })
}

const handleDateFromChange = useDebounceFn(updateDateFrom, 250)
const handleDateToChange = useDebounceFn(updateDateTo, 250)

const handleClearDates = () => {
 emit('update:filters', {
  dateFrom: null,
  dateTo: null,
  datePreset: 'custom',
 })
}

const isRefreshing = ref(false)
const handleRefresh = async () => {
 if (isRefreshing.value) return
 isRefreshing.value = true
 try {
  emit('refresh')
 } finally {
  setTimeout(() => {
   isRefreshing.value = false
  }, 400)
 }
}

const handleReset = () => {
 emit('reset')
}
</script>

<template>
 <div
  class="rounded-lg border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-end md:gap-4"
 >
  <div class="flex items-center gap-2">
   <Filter class="h-4 w-4 text-primary" />
   <h3 class="text-sm font-semibold tracking-tight">Dashboard Filters</h3>
   <Badge v-if="hasActiveFilters" variant="secondary" class="text-xs">
    Active
   </Badge>
  </div>

  <div class="grid gap-4 md:flex-1 md:grid-cols-12">
   <!-- Company -->
   <div v-if="showCompanySelect" class="space-y-1.5 md:col-span-4">
    <Label for="dashboard-company" class="text-xs">Company</Label>
    <Select
     :model-value="filters.companyId || 'none'"
     :disabled="isLoadingCompanies"
     @update:model-value="handleCompanyChange"
    >
     <SelectTrigger id="dashboard-company" class="h-9">
      <SelectValue
       :placeholder="
        isLoadingCompanies ? 'Loading companies...' : 'Select company'
       "
      />
     </SelectTrigger>
     <SelectContent>
      <SelectGroup>
       <SelectItem value="none" disabled>Select a company</SelectItem>
       <SelectItem
        v-for="company in companies"
        :key="company.id"
        :value="company.id"
       >
        {{ company.name }}
       </SelectItem>
      </SelectGroup>
     </SelectContent>
    </Select>
   </div>

   <!-- Location -->
   <div v-if="showLocationSelect" class="space-y-1.5 md:col-span-3">
    <Label for="dashboard-location" class="text-xs">Location</Label>
    <Select
     :model-value="filters.locationId || 'all'"
     :disabled="isLocationDisabled"
     @update:model-value="handleLocationChange"
    >
     <SelectTrigger id="dashboard-location" class="h-9">
      <SelectValue
       :placeholder="
        isLocationDisabled
         ? props.role === 'master'
           ? 'Select company first'
           : 'Loading locations...'
         : 'All locations'
       "
      />
     </SelectTrigger>
     <SelectContent>
      <SelectGroup>
       <SelectItem value="all">All Locations</SelectItem>
       <SelectItem
        v-for="location in locations"
        :key="location.id"
        :value="location.id"
       >
        {{ location.location_number }} - {{ location.name }}
       </SelectItem>
      </SelectGroup>
     </SelectContent>
    </Select>
   </div>

   <!-- Period -->
   <div class="space-y-1.5 md:col-span-3">
    <Label for="dashboard-period" class="text-xs">Period</Label>
    <Select
     :model-value="filters.datePreset"
     @update:model-value="handleDatePresetChange"
    >
     <SelectTrigger id="dashboard-period" class="h-9">
      <SelectValue placeholder="Select period" />
     </SelectTrigger>
     <SelectContent>
      <SelectGroup>
       <SelectItem
        v-for="preset in datePresets"
        :key="preset.value"
        :value="preset.value"
       >
        {{ preset.label }}
       </SelectItem>
      </SelectGroup>
     </SelectContent>
    </Select>
   </div>

   <!-- Date Range (custom) -->
   <div v-if="isCustomDateRange" class="space-y-1.5 md:col-span-5">
    <Label class="text-xs flex items-center gap-2">
     <Calendar class="h-3 w-3" />
     Date range
    </Label>
    <DateRangePicker
     :date-from="filters.dateFrom"
     :date-to="filters.dateTo"
     placeholder="Select date range"
     @update:date-from="handleDateFromChange"
     @update:date-to="handleDateToChange"
     @clear="handleClearDates"
    />
    <FieldError v-if="dateError" :errors="[dateError]" class="text-xs" />
   </div>
  </div>

  <div class="flex items-center gap-2 md:ml-auto">
   <Button
    variant="outline"
    size="sm"
    class="gap-2"
    :disabled="isRefreshing"
    @click="handleRefresh"
   >
    <RefreshCcw class="h-4 w-4" />
    Refresh
   </Button>
   <Button variant="ghost" size="sm" class="gap-2" @click="handleReset">
    <Building2 class="h-4 w-4" />
    Reset
   </Button>
   <div
    v-if="props.role === 'manager'"
    class="hidden lg:flex items-center gap-2"
   >
    <MapPin class="h-4 w-4 text-muted-foreground" />
    <span class="text-xs text-muted-foreground">Location scoped</span>
   </div>
  </div>
 </div>
</template>
