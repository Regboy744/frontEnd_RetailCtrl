<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { reactive, computed, watch } from 'vue'
import type { companiesWithAddressesType } from '@/supabase-queries/companies'
import { Switch } from '@/components/ui/switch'

interface Props {
  company: companiesWithAddressesType[0]
}
const props = defineProps<Props>()

const emit = defineEmits<{ save: [data: companiesWithAddressesType[0]] }>()

const companyFieldConfig = [
  { key: 'name', label: 'Company Name', section: 'company' },
  { key: 'brand', label: 'Brand', section: 'company' },
  { key: 'phone', label: 'Phone', section: 'contact' },
  { key: 'email', label: 'Email', section: 'contact' },
  { key: 'city', label: 'City', section: 'address' },
  { key: 'street', label: 'Street', section: 'address' },
  { key: 'complement', label: 'Complement', section: 'address' },
  { key: 'county', label: 'County', section: 'address' },
] as const

const formData = reactive({
  name: props.company.name,
  brand: props.company.brand,
  phone: props.company.phone,
  email: props.company.email,
  is_active: props.company.is_active,
  city: props.company.addresses[0]?.city ?? '',
  street: props.company.addresses[0]?.street_address ?? '',
  complement: props.company.addresses[0]?.address_line2 ?? '',
  county: props.company.addresses[0]?.county ?? '',
  eircode: props.company.addresses[0]?.eircode ?? '',
  country: props.company.addresses[0]?.country ?? '',
  id: props.company.id,
  addressId: props.company.addresses[0]?.id ?? null,
})

watch(
  formData,
  (newVal) => {
    console.log(newVal.is_active)
  },
  { deep: true },
)

console.log(formData.is_active)

// Organize fields by section
const sections = computed(() => ({
  company: companyFieldConfig.filter((f) => f.section === 'company'),
  contact: companyFieldConfig.filter((f) => f.section === 'contact'),
  address: companyFieldConfig.filter((f) => f.section === 'address'),
}))

const handleSave = () => {
  // Emit back in the same nested structure it came in
  const updatedCompany: companiesWithAddressesType[0] = {
    ...props.company,
    name: formData.name,
    brand: formData.brand,
    phone: formData.phone,
    email: formData.email,
    is_active: formData.is_active,
    addresses: [
      {
        id: formData.addressId || props.company.addresses[0]?.id || '',
        city: formData.city,
        street_address: formData.street,
        address_line2: formData.complement,
        county: formData.county,
        eircode: formData.eircode,
        country: formData.country,
      },
    ],
  }

  emit('save', updatedCompany)
}
</script>

<!-- TODO: Add form kit for better validation | Add dropdown for the bra |  -->

<template>
  <form @submit.prevent="handleSave" class="space-y-8 px-4">
    <!-- Company Information Section -->
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Company Information</h2>
        <hr class="mt-2 -mx-4" />
      </div>
      <div class="space-y-4">
        <div
          v-for="field in sections.company"
          :key="field.key"
          class="flex flex-col gap-2"
        >
          <label class="text-sm font-medium">{{ field.label }}</label>
          <Input v-model="formData[field.key]" />
        </div>
      </div>
    </div>
    <!-- Contact Information Section -->
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Contact Information</h2>
        <hr class="mt-2 -mx-4" />
      </div>
      <div class="space-y-4">
        <div
          v-for="field in sections.contact"
          :key="field.key"
          class="flex flex-col gap-2"
        >
          <label class="text-sm font-medium">{{ field.label }}</label>
          <Input v-model="formData[field.key]" />
        </div>
      </div>
    </div>
    <!-- Address Section -->
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Address</h2>
        <hr class="mt-2 -mx-4" />
      </div>
      <div class="space-y-4">
        <div
          v-for="field in sections.address"
          :key="field.key"
          class="flex flex-col gap-2"
        >
          <label class="text-sm font-medium">{{ field.label }}</label>
          <Input v-model="formData[field.key]" />
        </div>
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
