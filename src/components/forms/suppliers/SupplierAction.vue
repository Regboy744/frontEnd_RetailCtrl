<script setup lang="ts">
import DataTableAction from '@/components/app-layout/dataTable/DataTableAction.vue'
import type { Tables } from '@/types/database.types'
import SupplierEditForm from './SupplierEditForm.vue'

type SupplierTypeUpdate = Pick<Tables<'suppliers'>, 'id' | 'name' | 'is_active'>

interface Props {
  suppliers: SupplierTypeUpdate
}

const props = defineProps<Props>()

// TODO: Add the supabase mutations Save and Delete

const handleDelete = async (id: string) => {
  const confirmed = confirm(`Delete ${props.suppliers.name}?`)
  if (!confirmed) {
    console.log('Delete calceld: ', id)
  }

  if (confirmed) {
    console.log(id, 'Deleted')
  }
}

// TODO: Move it to a query or composable

const handleSave = async (suppliers: SupplierTypeUpdate) => {
  // Split and update both tables
  const { id, name, is_active } = suppliers

  console.log(id, name, is_active)
}
</script>

<template>
  <DataTableAction
    :row="suppliers"
    :title="`Edit ${suppliers.name}`"
    :description="`Make changes to ${suppliers.name}`"
    @delete="handleDelete"
  >
    <template #edit-form="{ row, close }">
      <SupplierEditForm
        :suppliers="row"
        @save="
          async (supplier) => {
            await handleSave(supplier)
            close()
          }
        "
      />
    </template>
  </DataTableAction>
</template>
