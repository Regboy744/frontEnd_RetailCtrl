<template>
 <div>
  <h1>Company name {{ companyName }}</h1>
 </div>
</template>

<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { usePageTitleStore } from '@/stores/pageTitle'
import { onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute('/app/companies/[id]')

const id = route.params.id
const pageTitleStore = usePageTitleStore()

const companyName = ref('')
const getCompanyName = async () => {
 const { data } = await supabase
  .from('companies')
  .select('name')
  .eq('id', id)
  .single()

 companyName.value = data?.name ?? ''

 // Set the breadcrumbLabel on pinia
 if (data?.name) {
  pageTitleStore.setBreadcrumbLabel(data.name)
 }
}

await getCompanyName()

// Clear the breadcrumbLabel when leave the page
onUnmounted(() => {
 pageTitleStore.clearBreadcumbLabel()
})
</script>
