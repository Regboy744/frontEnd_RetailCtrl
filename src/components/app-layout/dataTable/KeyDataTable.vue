<script setup lang="ts" generic="TData, TValue">
import type {
 ColumnDef,
 SortingState,
 ColumnFiltersState,
 VisibilityState,
} from '@tanstack/vue-table'
import {
 FlexRender,
 getCoreRowModel,
 useVueTable,
 getPaginationRowModel,
 getSortedRowModel,
 getFilteredRowModel,
} from '@tanstack/vue-table'

import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { valueUpdater } from '@/components/ui/table/utils'
import { ref } from 'vue'
import { Input } from '@/components/ui/input'

import {
 DropdownMenu,
 DropdownMenuCheckboxItem,
 DropdownMenuContent,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
 columns: ColumnDef<TData, TValue>[]
 data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

const table = useVueTable({
 get data() {
  return props.data
 },
 get columns() {
  return props.columns
 },
 getCoreRowModel: getCoreRowModel(),
 getPaginationRowModel: getPaginationRowModel(),
 initialState: {
  pagination: {
   pageSize: 20,
  },
 },
 getSortedRowModel: getSortedRowModel(),
 onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
 onColumnFiltersChange: (updaterOrValue) =>
  valueUpdater(updaterOrValue, columnFilters),
 getFilteredRowModel: getFilteredRowModel(),
 onColumnVisibilityChange: (updaterOrValue) =>
  valueUpdater(updaterOrValue, columnVisibility),
 onRowSelectionChange: (updaterOrValue) =>
  valueUpdater(updaterOrValue, rowSelection),
 state: {
  get sorting() {
   return sorting.value
  },
  get columnFilters() {
   return columnFilters.value
  },
  get columnVisibility() {
   return columnVisibility.value
  },
  get rowSelection() {
   return rowSelection.value
  },
 },
})
</script>

<template>
 <div class="flex items-center py-4">
  <Input
   class="max-w-sm"
   placeholder="Filter emails..."
   :model-value="table.getColumn('phone')?.getFilterValue() as string"
   @update:model-value="table.getColumn('phone')?.setFilterValue($event)"
  />
  <DropdownMenu>
   <DropdownMenuTrigger as-child>
    <Button variant="outline" class="ml-auto">
     Columns
     <ChevronDown class="w-4 h-4 ml-2" />
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end">
    <DropdownMenuCheckboxItem
     v-for="column in table
      .getAllColumns()
      .filter((column) => column.getCanHide())"
     :key="column.id"
     class="capitalize"
     :modelValue="column.getIsVisible()"
     @update:modelValue="
      (value) => {
       column.toggleVisibility(!!value)
      }
     "
    >
     {{ column.id }}
    </DropdownMenuCheckboxItem>
   </DropdownMenuContent>
  </DropdownMenu>
 </div>
 <div class="border rounded-md max-h-[calc(75vh)] overflow-y-auto">
  <Table>
   <TableHeader>
    <TableRow
     v-for="headerGroup in table.getHeaderGroups()"
     :key="headerGroup.id"
    >
     <TableHead v-for="header in headerGroup.headers" :key="header.id">
      <FlexRender
       v-if="!header.isPlaceholder"
       :render="header.column.columnDef.header"
       :props="header.getContext()"
      />
     </TableHead>
    </TableRow>
   </TableHeader>
   <TableBody>
    <template v-if="table.getRowModel().rows?.length">
     <TableRow
      v-for="row in table.getRowModel().rows"
      :key="row.id"
      :data-state="row.getIsSelected() ? 'selected' : undefined"
     >
      <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
       <FlexRender
        :render="cell.column.columnDef.cell"
        :props="cell.getContext()"
       />
      </TableCell>
     </TableRow>
    </template>
    <template v-else>
     <TableRow>
      <TableCell :colspan="columns.length" class="h-24 text-center">
       No results.
      </TableCell>
     </TableRow>
    </template>
   </TableBody>
  </Table>
 </div>
 <div class="flex items-center justify-end py-4 space-x-1">
  <div class="flex-1 text-sm text-muted-foreground">
   {{ table.getFilteredSelectedRowModel().rows.length }} of
   {{ table.getFilteredRowModel().rows.length }} row(s) selected.
  </div>
  <Button
   variant="outline"
   size="sm"
   :disabled="!table.getCanPreviousPage()"
   @click="table.previousPage()"
  >
   Previous
  </Button>
  <Button
   variant="outline"
   size="sm"
   :disabled="!table.getCanNextPage()"
   @click="table.nextPage()"
  >
   Next
  </Button>
 </div>
</template>

<style scoped>
td {
 padding: 4px;
}
</style>
