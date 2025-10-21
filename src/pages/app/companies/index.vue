<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { h, ref } from 'vue'
import type { Tables } from '@/types/database.types'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTable from '@/components/app-layout/dataTable/DataTable.vue'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableDropDown from '@/components/app-layout/dataTable/DataTableDropDown.vue'
import { RouterLink } from 'vue-router'

const companies = ref<Tables<'companies'>[] | null>(null)

const getCompanies = async () => {
 const { data, error } = await supabase.from('companies').select()

 if (error) console.log(error)

 companies.value = data

 return data
}

await getCompanies()

//Table

const columns: ColumnDef<Tables<'companies'>>[] = [
 {
  id: 'select',
  header: ({ table }) =>
   h('div', { class: 'flex items-center gap-2' }, [
    h(Checkbox, {
     modelValue: table.getIsAllPageRowsSelected(),
     'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
      table.toggleAllPageRowsSelected(!!value),
     ariaLabel: 'Select all',
    }),
    ,
   ]),
  cell: ({ row }) =>
   h(Checkbox, {
    modelValue: row.getIsSelected(),
    'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
     row.toggleSelected(!!value),
    ariaLabel: 'Select row',
   }),
  enableSorting: false,
  enableHiding: false,
 },
 {
  accessorKey: 'name',
  header: () => h('div', { class: 'text-left' }, 'Company Name'),
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
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
   const payment = row.original

   return h(
    'div',
    { class: 'relative' },
    h(DataTableDropDown, {
     payment,
    }),
   )
  },
 },
]
</script>

<template>
 <DataTable v-if="companies" :columns="columns" :data="companies" />
</template>
