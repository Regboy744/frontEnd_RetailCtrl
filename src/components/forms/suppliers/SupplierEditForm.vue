<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { reactive } from 'vue'
import { Switch } from '@/components/ui/switch'
import type { Tables } from '@/types/database.types'

type SupplierTypeUpdate = Pick<Tables<'suppliers'>, 'id' | 'name' | 'is_active'>

interface Props {
  suppliers: SupplierTypeUpdate
}
const props = defineProps<Props>()

const emit = defineEmits<{ save: [data: SupplierTypeUpdate] }>()
// FIX: The is active cannot be null
const formData = reactive({
  id: props.suppliers?.id ?? '',
  name: props.suppliers?.name ?? '',
  is_active: props.suppliers?.is_active ?? null,
})

const handleSave = () => {
  // Emit back in the same  structure it came in
  const updatedsupplier: SupplierTypeUpdate = {
    id: formData.id,
    name: formData.name,
    is_active: formData.is_active,
  }

  emit('save', updatedsupplier)
}
</script>

<!-- TODO: Add form kit for better validation | Add dropdown for the brand  -->

<template>
  <form @submit.prevent="handleSave" class="space-y-8 px-4">
    <div>
      <h2 class="text-lg font-semibold">Supp"lier Information</h2>
      <hr class="mt-2 -mx-4" />
    </div>

    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">Name</label>
        <Input v-model="formData.name" />
      </div>
    </div>
    <!-- Status Section -->
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Status</h2>
        <hr class="mt-2 -mx-4" />
      </div>
      <div class="flex items-center justify-between p-4 border rounded-lg">
        <div class="space-y-0.5">
          <label class="text-sm font-medium">Company Status</label>
          <p class="text-sm text-muted-foreground">
            {{ formData.is_active ? 'Active' : 'Inactive' }}
          </p>
        </div>
        <Switch v-model="formData.is_active" />
      </div>
    </div>

    <!-- Submit Button -->
    <div class="pt-4">
      <Button type="submit" class="w-full md:w-auto">Save Changes</Button>
    </div>
  </form>
</template>
