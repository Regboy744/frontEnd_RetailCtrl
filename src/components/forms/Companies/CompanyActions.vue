<script setup lang="ts">
import DataTableAction from '@/components/app-layout/dataTable/DataTableAction.vue'
import CompanyEditForm from '@/components/forms/Companies/CompanyEditForm.vue'
import { supabase } from '@/lib/supabaseClient'
import type { companiesWithAddressesType } from '@/supabase-queries/companies'

interface Props {
  company: companiesWithAddressesType[0]
}

const props = defineProps<Props>()

const handleDelete = async (id: string) => {
  const confirmed = confirm(`Delete ${props.company.name}?`)
  if (!confirmed) {
    console.log('Delete calceld: ', id)
  }

  if (confirmed) {
    console.log(id, 'Deleted')
  }
}

// TODO: Move it to a query or composable
const handleSave = async (company: companiesWithAddressesType[0]) => {
  // Split and update both tables
  const { addresses, ...companyData } = company

  console.log(addresses, companyData)
  // Update company
  await supabase.from('companies').update(companyData).eq('id', company.id)

  // Update address
  if (addresses?.[0]) {
    await supabase
      .from('addresses')
      .update(addresses[0])
      .eq('id', addresses[0].id)
  }
}
</script>

<template>
  <DataTableAction
    :row="company"
    :title="`Edit ${company.name}`"
    :description="`Make changes to ${company.name}`"
    @delete="handleDelete"
  >
    <template #edit-form="{ row, close }">
      <CompanyEditForm
        :company="row"
        @save="
          async (company) => {
            await handleSave(company)
            close()
          }
        "
      />
    </template>
  </DataTableAction>
</template>
