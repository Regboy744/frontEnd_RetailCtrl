import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import { getPresetDateRange, type DatePreset } from '@/lib/utils/datePresets'
import {
 dashboardCompaniesQuery,
 dashboardCredentialHealthQuery,
 dashboardExpiringPricesQuery,
 dashboardLocationsQuery,
 dashboardOrderItemsQuery,
 dashboardOrdersQuery,
 dashboardSavingsCalculationsQuery,
 type DashboardCredentialHealthType,
 type DashboardExpiringPricesType,
 type DashboardOrderItemsType,
 type DashboardOrdersType,
 type DashboardSavingsCalculationsType,
} from '@/features/dashboard/api/queries'
import type {
 CompanyOption,
 CredentialIssueRow,
 CredentialLoginStatus,
 DashboardAlerts,
 DashboardFilters,
 DashboardKpis,
 ExpiringPriceRow,
 LocationOption,
 TopProductRow,
} from '@/features/dashboard/types'

function emptyKpis(): DashboardKpis {
 return {
  ordersCount: 0,
  spendTotal: 0,
  avgOrderValue: 0,
  savedTotal: 0,
  overspendTotal: 0,
  savingsRate: 0,
  missedSavingsTotal: 0,
  missedLinesCount: 0,
 }
}

function emptyAlerts(): DashboardAlerts {
 return {
  credentialIssues: [],
  expiringPrices: [],
 }
}

function normalizeLoginStatus(status: string | null): CredentialLoginStatus {
 if (status === 'success') return 'success'
 if (status === 'failed') return 'failed'
 if (status === 'expired') return 'expired'
 if (status === 'pending') return 'pending'
 return 'unknown'
}

export const useDashboard = () => {
 const authStore = useAuthStore()
 const errorStore = useErrorStore()

 const companies = ref<CompanyOption[]>([])
 const locations = ref<LocationOption[]>([])

 const isLoadingCompanies = ref(false)
 const isLoadingLocations = ref(false)
 const isLoadingDashboard = ref(false)

 const filters = ref<DashboardFilters>({
  companyId: null,
  locationId: null,
  dateFrom: null,
  dateTo: null,
  datePreset: 'month',
 })

 const kpis = ref<DashboardKpis>(emptyKpis())
 const topProductsByUnits = ref<TopProductRow[]>([])
 const topProductsBySpend = ref<TopProductRow[]>([])
 const alerts = ref<DashboardAlerts>(emptyAlerts())

 const role = computed(() => authStore.userRole)

 const effectiveCompanyId = computed(() => {
  if (role.value === 'master') return filters.value.companyId
  return authStore.companyId
 })

 const effectiveLocationId = computed(() => {
  if (role.value === 'manager') return authStore.locationId
  return filters.value.locationId
 })

 const dateError = computed(() => {
  if (filters.value.datePreset !== 'custom') return null

  const { dateFrom, dateTo } = filters.value
  if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
   return 'Both From and To dates are required'
  }

  if (dateFrom && dateTo) {
   const from = new Date(dateFrom)
   const to = new Date(dateTo)
   if (from > to) {
    return 'From date cannot be after To date'
   }
  }

  return null
 })

 const isScopeReady = computed(() => {
  if (!effectiveCompanyId.value) return false
  return !dateError.value
 })

 const showNoCompanyMessage = computed(() => {
  return (
   (role.value === 'admin' || role.value === 'manager') && !authStore.companyId
  )
 })

 const showEmptyPeriodMessage = computed(() => {
  return (
   isScopeReady.value &&
   !isLoadingDashboard.value &&
   kpis.value.ordersCount === 0
  )
 })

 const showSelectCompanyMessage = computed(() => {
  return role.value === 'master' && !filters.value.companyId
 })

 const applyDatePreset = (preset: DatePreset) => {
  const range = getPresetDateRange(preset)
  filters.value = {
   ...filters.value,
   datePreset: preset,
   dateFrom: range.dateFrom,
   dateTo: range.dateTo,
  }
 }

 const resetDashboard = () => {
  kpis.value = emptyKpis()
  topProductsByUnits.value = []
  topProductsBySpend.value = []
 }

 const fetchCompanies = async () => {
  isLoadingCompanies.value = true
  try {
   const { data, error, status } = await dashboardCompaniesQuery()
   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }
   companies.value = (data ?? []).map((c) => ({ id: c.id, name: c.name }))
   return companies.value
  } finally {
   isLoadingCompanies.value = false
  }
 }

 const fetchLocations = async (companyId: string) => {
  isLoadingLocations.value = true
  try {
   const { data, error, status } = await dashboardLocationsQuery(companyId)
   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }
   locations.value = (data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    location_number: l.location_number,
   }))
   return locations.value
  } finally {
   isLoadingLocations.value = false
  }
 }

 const updateFilters = (patch: Partial<DashboardFilters>) => {
  filters.value = {
   ...filters.value,
   ...patch,
  }
 }

 const resetFilters = () => {
  const range = getPresetDateRange('month')
  filters.value = {
   companyId: role.value === 'master' ? null : filters.value.companyId,
   locationId: role.value === 'admin' ? (authStore.locationId ?? null) : null,
   datePreset: 'month',
   dateFrom: range.dateFrom,
   dateTo: range.dateTo,
  }
 }

 const refreshDashboard = async () => {
  if (!isScopeReady.value) {
   resetDashboard()
   alerts.value = emptyAlerts()
   return
  }

  const companyId = effectiveCompanyId.value
  if (!companyId) {
   resetDashboard()
   alerts.value = emptyAlerts()
   return
  }

  isLoadingDashboard.value = true

  try {
   const now = new Date()
   const cutoff = new Date(now)
   cutoff.setDate(now.getDate() + 30)

   const credentialPromise = dashboardCredentialHealthQuery(
    companyId,
    effectiveLocationId.value,
   )
   const expiringPromise = dashboardExpiringPricesQuery(
    companyId,
    now.toISOString(),
    cutoff.toISOString(),
   )

   const {
    data: ordersData,
    error: ordersError,
    status: ordersStatus,
   } = await dashboardOrdersQuery({
    companyId,
    locationId: effectiveLocationId.value,
    dateFrom: filters.value.dateFrom,
    dateTo: filters.value.dateTo,
   })

   if (ordersError) {
    errorStore.setError({ error: ordersError, customCode: ordersStatus })
    resetDashboard()
    alerts.value = emptyAlerts()
    return
   }

   const orders = (ordersData ?? []) as DashboardOrdersType
   const orderIds = orders.map((o) => o.id)
   const ordersCount = orderIds.length
   const spendTotal = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
   const avgOrderValue = ordersCount > 0 ? spendTotal / ordersCount : 0

   const {
    data: itemsData,
    error: itemsError,
    status: itemsStatus,
   } = await dashboardOrderItemsQuery(orderIds)

   if (itemsError) {
    errorStore.setError({ error: itemsError, customCode: itemsStatus })
    resetDashboard()
    alerts.value = emptyAlerts()
    return
   }

   const orderItems = (itemsData ?? []) as DashboardOrderItemsType
   const orderItemIds = orderItems.map((i) => i.id)

   const {
    data: savingsData,
    error: savingsError,
    status: savingsStatus,
   } = await dashboardSavingsCalculationsQuery(companyId, orderItemIds)

   if (savingsError) {
    errorStore.setError({ error: savingsError, customCode: savingsStatus })
    resetDashboard()
    alerts.value = emptyAlerts()
    return
   }

   const savings = (savingsData ?? []) as DashboardSavingsCalculationsType

   const [credentialRes, expiringRes] = await Promise.all([
    credentialPromise,
    expiringPromise,
   ])

   const credentialData = (credentialRes.data ??
    []) as DashboardCredentialHealthType
   const credentialIssues: CredentialIssueRow[] = credentialData
    .map((c) => {
     const supplierName =
      (c.suppliers as { name?: string } | null)?.name ?? 'Unknown supplier'
     const locationName =
      (c.locations as { name?: string } | null)?.name ?? 'Unknown location'
     const locationNumber =
      (c.locations as { location_number?: number } | null)?.location_number ??
      null

     return {
      id: c.id,
      supplierName,
      locationName,
      locationNumber,
      status: normalizeLoginStatus(c.last_login_status),
      lastLoginAt: c.last_login_at,
      lastErrorMessage: c.last_error_message,
     }
    })
    .filter((c) => c.status !== 'success')

   if (credentialRes.error) {
    errorStore.setError({
     error: credentialRes.error,
     customCode: credentialRes.status,
    })
   }

   const expiringData = (expiringRes.data ?? []) as DashboardExpiringPricesType
   const expiringPrices: ExpiringPriceRow[] = expiringData
    .filter((p) => !!p.valid_until)
    .map((p) => {
     const supplierName =
      (p.suppliers as { name?: string } | null)?.name ?? 'Unknown supplier'
     const productDescription =
      (p.master_products as { description?: string } | null)?.description ??
      'Unknown product'
     const articleCode =
      (p.master_products as { article_code?: string } | null)?.article_code ??
      '-'

     return {
      id: p.id,
      supplierName,
      productDescription,
      articleCode,
      negotiatedPrice: p.negotiated_price,
      validUntil: p.valid_until as string,
     }
    })

   if (expiringRes.error) {
    errorStore.setError({
     error: expiringRes.error,
     customCode: expiringRes.status,
    })
   }

   alerts.value = {
    credentialIssues,
    expiringPrices,
   }

   // Map order IDs to dates for per-product latest ordering
   const orderDateById = new Map<string, string>()
   for (const o of orders) {
    orderDateById.set(o.id, o.order_date)
   }

   // Map order item ID to quantity
   const quantityByOrderItemId = new Map<string, number>()
   for (const item of orderItems) {
    quantityByOrderItemId.set(item.id, item.quantity)
   }

   let savedTotal = 0
   let overspendTotal = 0
   let baselineTotal = 0
   let missedSavingsTotal = 0
   let missedLinesCount = 0

   for (const s of savings) {
    const delta = s.delta_vs_baseline ?? 0
    if (delta < 0) {
     savedTotal += -delta
    } else if (delta > 0) {
     overspendTotal += delta
    }

    const qty = quantityByOrderItemId.get(s.order_item_id) ?? 0
    baselineTotal += (s.baseline_price ?? 0) * qty

    if (
     typeof s.best_external_price === 'number' &&
     s.best_external_price < s.chosen_price
    ) {
     missedSavingsTotal += (s.chosen_price - s.best_external_price) * qty
     missedLinesCount += 1
    }
   }

   const savingsRate = baselineTotal > 0 ? savedTotal / baselineTotal : 0

   // Top products
   const aggregated = new Map<string, TopProductRow>()
   for (const item of orderItems) {
    const existing = aggregated.get(item.master_product_id)
    const product = item.master_products as {
     description: string
     article_code: string
     unit_size: string | null
    } | null

    const orderDate = orderDateById.get(item.order_id) ?? null
    const description = product?.description ?? 'Unknown product'
    const articleCode = product?.article_code ?? '-'
    const unitSize = product?.unit_size ?? null

    if (!existing) {
     aggregated.set(item.master_product_id, {
      master_product_id: item.master_product_id,
      description,
      article_code: articleCode,
      unit_size: unitSize,
      quantity: item.quantity,
      spend: item.total_price,
      lastOrderDate: orderDate,
     })
     continue
    }

    existing.quantity += item.quantity
    existing.spend += item.total_price
    if (
     orderDate &&
     (!existing.lastOrderDate || orderDate > existing.lastOrderDate)
    ) {
     existing.lastOrderDate = orderDate
    }
   }

   const rows = Array.from(aggregated.values())
   topProductsByUnits.value = [...rows]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
   topProductsBySpend.value = [...rows]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10)

   kpis.value = {
    ordersCount,
    spendTotal,
    avgOrderValue,
    savedTotal,
    overspendTotal,
    savingsRate,
    missedSavingsTotal,
    missedLinesCount,
   }
  } finally {
   isLoadingDashboard.value = false
  }
 }

 const debouncedRefresh = useDebounceFn(refreshDashboard, 250)

 // Defaults: this month + role-specific initial location
 onMounted(() => {
  applyDatePreset('month')
 })

 watch(
  () => role.value,
  (newRole) => {
   if (!newRole) return
   if (newRole === 'master') {
    fetchCompanies()
    locations.value = []
    filters.value.locationId = null
    return
   }

   // Admin/manager: company is derived from auth store, but location may be
   // pre-selected to the user's location for convenience.
   if (newRole === 'admin') {
    filters.value.locationId = authStore.locationId ?? null
   }
  },
  { immediate: true },
 )

 watch(
  () => filters.value.companyId,
  (companyId) => {
   if (role.value !== 'master') return
   filters.value.locationId = null
   locations.value = []
   if (companyId) {
    fetchLocations(companyId)
   }
  },
 )

 watch(
  () => authStore.companyId,
  (companyId) => {
   if (!companyId) return
   if (role.value === 'admin') {
    fetchLocations(companyId)
   }
  },
  { immediate: true },
 )

 watch(
  () => [
   role.value,
   effectiveCompanyId.value,
   effectiveLocationId.value,
   filters.value.dateFrom,
   filters.value.dateTo,
   filters.value.datePreset,
   dateError.value,
  ],
  () => {
   debouncedRefresh()
  },
  { immediate: true },
 )

 return {
  // State
  role,
  companies,
  locations,
  filters,
  kpis,
  topProductsByUnits,
  topProductsBySpend,
  alerts,
  dateError,
  showSelectCompanyMessage,
  showNoCompanyMessage,
  showEmptyPeriodMessage,

  // Loading
  isLoadingCompanies,
  isLoadingLocations,
  isLoadingDashboard,

  // Actions
  updateFilters,
  resetFilters,
  applyDatePreset,
  refreshDashboard,
 }
}
