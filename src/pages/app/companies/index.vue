<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { h, ref } from 'vue'
import type { Tables } from '@/types/database.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { RouterLink } from 'vue-router'
import type { DataTableConfig } from '@/types/custom.types'
import DataTable from '@/components/app-layout/dataTable/DataTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { ArrowUpDown } from 'lucide-vue-next'
import DataTableAction from '@/components/app-layout/dataTable/DataTableAction.vue'

const companies = ref<Tables<'companies'>[] | null>(null)

const getCompanies = async () => {
 const { data, error } = await supabase.from('companies').select()

 if (error) console.log(error)

 companies.value = data

 return data
}

await getCompanies()

// Table config
const tableConfig: DataTableConfig = {
 features: {
  rowSelection: false,
  pagination: true,
  sorting: true,
  filtering: true,
  columnVisibility: false,
 },
 pageSize: 20,
 searchColumn: 'name',
 searchPlaceholder: 'Filter companies by name ...',
}

//Table

const columns: ColumnDef<Tables<'companies'>>[] = [
 // {
 //  id: 'select',
 //  header: ({ table }) =>
 //   h('div', { class: 'flex items-center gap-2' }, [
 //    h(Checkbox, {
 //     modelValue: table.getIsAllPageRowsSelected(),
 //     'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
 //      table.toggleAllPageRowsSelected(!!value),
 //     ariaLabel: 'Select all',
 //    }),
 //    ,
 //   ]),
 //  cell: ({ row }) =>
 //   h(Checkbox, {
 //    modelValue: row.getIsSelected(),
 //    'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
 //     row.toggleSelected(!!value),
 //    ariaLabel: 'Select row',
 //   }),
 // },
 {
  accessorKey: 'name',
  header: ({ column }) => {
   return h(
    Button,
    {
     class: 'hover:bg-transparent hover:text-current',
     variant: 'ghost',
     onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    },
    () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
   )
  },
  cell: ({ row }) => {
   return h(
    RouterLink,
    {
     to: `/app/companies/${row.original.id}`,
     class: 'text-left font-medium hover:muted block w-full',
    },
    () => row.getValue('name'),
   )
  },
  enableSorting: true,
  enableHiding: true,
 },
 {
  accessorKey: 'brand',
  header: () => h('div', { class: 'text-left' }, 'Brand'),
  cell: ({ row }) => {
   const brandName =
    row.getValue('brand') === 'super-value' ? 'Super value' : 'Centra'
   return h('div', { class: 'text-left font-medium' }, brandName)
  },
 },
 {
  accessorKey: 'phone',
  header: () => h('div', { class: 'text-left' }, 'Phone'),
  cell: ({ row }) => {
   return h('div', { class: 'text-left font-medium' }, row.getValue('phone'))
  },
 },
 {
  accessorKey: 'email',
  header: () => h('div', { class: 'text-left' }, 'email'),
  cell: ({ row }) => {
   return h('div', { class: 'text-left font-medium' }, row.getValue('email'))
  },
 },
 {
  accessorKey: 'is_active',
  header: () => h('div', { class: 'text-left' }, 'Status'),
  cell: ({ row }) => {
   const status = row.getValue('is_active') === true ? 'Active' : 'Inactive'
   return h('div', { class: 'text-left font-medium' }, status)
  },
 },
 {
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
   return h(
    'div',
    { class: 'relative' },
    h(DataTableAction, {
     row: row.original,
    }),
   )
  },
 },
]
</script>

<template>
 <DataTable
  v-if="companies"
  :columns="columns"
  :data="companies"
  :config="tableConfig"
 />
</template>
