<script setup lang="ts">
definePage({
 meta: {
  allowedRoles: ['master'],
 },
})

import { supabase } from '@/lib/supabaseClient'
import { ref } from 'vue'
import type { Tables } from '@/types/shared/database.types'

const suppliers = ref<Tables<'suppliers'>[] | null>(null)

;(async () => {
 const { data, error } = await supabase.from('suppliers').select()

 if (error) console.log(error)

 suppliers.value = data
})()
</script>

<template>
 <div>
  <h1>suppliers</h1>
  <ul>
   <li v-for="supplier in suppliers" :key="supplier.id">
    {{ supplier.name }}
   </li>
  </ul>
 </div>
</template>
