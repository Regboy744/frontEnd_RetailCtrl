import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error'
import {
 companiesQuery,
 locationsByCompanyQuery,
 ordersQuery,
 orderDetailQuery,
 orderItemsCountQuery,
 type CompaniesQueryType,
 type LocationsByCompanyQueryType,
} from '@/features/orders/api/queries'
import type {
 OrderFilters,
 OrderStats,
 OrderWithLocation,
 OrderDetail,
 OrderItemWithProduct,
} from '@/features/orders/types'

export const useOrders = () => {
 const errorStore = useErrorStore()

 // State
 const companies = ref<CompaniesQueryType>([])
 const locations = ref<LocationsByCompanyQueryType>([])
 const orders = ref<OrderWithLocation[]>([])
 const orderDetail = ref<OrderDetail | null>(null)
 const isLoading = ref(false)
 const isLoadingLocations = ref(false)
 const isLoadingDetail = ref(false)

 // Filters
 const filters = ref<OrderFilters>({
  companyId: null,
  locationId: null,
  dateFrom: null,
  dateTo: null,
  status: [],
  datePreset: undefined,
 })

 // Statistics
 const orderStats = computed<OrderStats>(() => {
  const totalOrders = orders.value.length
  const totalAmount = orders.value.reduce(
   (sum, order) => sum + (order.total_amount || 0),
   0,
  )

  // Calculate total saved from baseline_unit_price
  // Note: We'll need to fetch order items to calculate savings
  // For now, return 0 - we can enhance this later
  const totalSaved = 0

  const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0

  return {
   totalOrders,
   totalAmount,
   totalSaved,
   avgOrderValue,
  }
 })

 // Fetch companies for dropdown
 const fetchCompanies = async () => {
  isLoading.value = true
  try {
   const { data, error, status } = await companiesQuery()

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   companies.value = data ?? []
   return data
  } finally {
   isLoading.value = false
  }
 }

 // Fetch locations by company
 const fetchLocations = async (companyId: string) => {
  if (!companyId) {
   locations.value = []
   return []
  }

  isLoadingLocations.value = true
  try {
   const { data, error, status } = await locationsByCompanyQuery(companyId)

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   locations.value = data ?? []
   return data
  } finally {
   isLoadingLocations.value = false
  }
 }

 // Validate date range before fetching
 const isDateRangeValid = (): boolean => {
  // If custom preset is selected, both dates must be provided and valid
  if (filters.value.datePreset === 'custom') {
   const { dateFrom, dateTo } = filters.value

   // Both dates required
   if (!dateFrom || !dateTo) {
    return false
   }

   // From must not be after To
   const fromDate = new Date(dateFrom)
   const toDate = new Date(dateTo)

   if (fromDate > toDate) {
    return false
   }
  }

  return true
 }

 // Fetch orders with current filters
 const fetchOrders = async () => {
  if (!filters.value.companyId) {
   orders.value = []
   return []
  }

  // Don't fetch if date range is invalid
  if (!isDateRangeValid()) {
   orders.value = []
   return []
  }

  isLoading.value = true
  try {
   const { data, error, status } = await ordersQuery(filters.value)

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   // Fetch item counts for each order
   const orderIds = data?.map((order) => order.id) ?? []
   if (orderIds.length > 0) {
    const { data: itemsData } = await orderItemsCountQuery(orderIds)

    // Count items per order
    const itemCounts = (itemsData ?? []).reduce(
     (acc, item) => {
      acc[item.order_id] = (acc[item.order_id] || 0) + 1
      return acc
     },
     {} as Record<string, number>,
    )

    // Add item counts to orders
    const ordersWithCounts = (data ?? []).map((order) => ({
     ...order,
     itemsCount: itemCounts[order.id] || 0,
    }))

    orders.value = ordersWithCounts
    return ordersWithCounts
   }

   orders.value = data ?? []
   return data
  } finally {
   isLoading.value = false
  }
 }

 // Fetch single order detail
 const fetchOrderDetail = async (orderId: string) => {
  isLoadingDetail.value = true
  try {
   const { data, error, status } = await orderDetailQuery(orderId)

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   // Calculate savings for each item
   if (data?.order_items) {
    const itemsWithSavings = data.order_items.map((item) => {
     const savings =
      item.baseline_unit_price && item.unit_price
       ? (item.baseline_unit_price - item.unit_price) * item.quantity
       : 0
     return {
      ...item,
      savings,
     }
    })

    orderDetail.value = {
     ...data,
     order_items: itemsWithSavings as OrderItemWithProduct[],
    }
   } else {
    orderDetail.value = data as OrderDetail
   }

   return orderDetail.value
  } finally {
   isLoadingDetail.value = false
  }
 }

 // Update filters
 const updateFilters = async (newFilters: Partial<OrderFilters>) => {
  filters.value = {
   ...filters.value,
   ...newFilters,
  }

  // If company changed, reset location and fetch new locations
  if (newFilters.companyId !== undefined) {
   if (newFilters.companyId !== filters.value.companyId) {
    filters.value.locationId = null
   }
   if (newFilters.companyId) {
    await fetchLocations(newFilters.companyId)
   }
  }

  // Fetch orders with new filters
  await fetchOrders()
 }

 // Reset filters
 const resetFilters = () => {
  filters.value = {
   companyId: null,
   locationId: null,
   dateFrom: null,
   dateTo: null,
   status: [],
   datePreset: undefined,
  }
  locations.value = []
  orders.value = []
 }

 // Apply date preset
 const applyDatePreset = async (preset: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let dateFrom: Date | null = null
  let dateTo: Date | null = null

  switch (preset) {
   case 'today':
    dateFrom = new Date(today)
    dateTo = new Date(today)
    dateTo.setHours(23, 59, 59, 999)
    break
   case 'week':
    dateFrom = new Date(today)
    dateFrom.setDate(today.getDate() - today.getDay()) // Start of week
    dateTo = new Date(today)
    dateTo.setDate(dateFrom.getDate() + 6) // End of week
    dateTo.setHours(23, 59, 59, 999)
    break
   case 'month':
    dateFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    dateTo.setHours(23, 59, 59, 999)
    break
   case 'lastMonth':
    dateFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    dateTo = new Date(today.getFullYear(), today.getMonth(), 0)
    dateTo.setHours(23, 59, 59, 999)
    break
   case 'custom':
    // Clear dates when switching to custom (user will set manually)
    dateFrom = null
    dateTo = null
    break
  }

  await updateFilters({
   dateFrom: dateFrom?.toISOString().split('T')[0] || null,
   dateTo: dateTo?.toISOString().split('T')[0] || null,
   datePreset: preset as 'today' | 'week' | 'month' | 'lastMonth' | 'custom',
  })
 }

 return {
  // State
  companies,
  locations,
  orders,
  orderDetail,
  filters,
  orderStats,
  isLoading,
  isLoadingLocations,
  isLoadingDetail,

  // Methods
  fetchCompanies,
  fetchLocations,
  fetchOrders,
  fetchOrderDetail,
  updateFilters,
  resetFilters,
  applyDatePreset,

  // Validation
  isDateRangeValid,
 }
}
