<script setup lang="ts">
import { computed } from 'vue'
import type { SidebarProps } from '@/components/ui/sidebar'

import {
 Store,
 Euro,
 ReceiptText,
 Tags,
 Building2,
 ShoppingCart,
 Truck,
 Package,
 Users,
} from 'lucide-vue-next'
import NavFlat from '@/components/app-layout/NavFlat.vue'
import NavUser from '@/components/app-layout/NavUser.vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/auth/usePermissions'

import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
 collapsible: 'icon',
 variant: 'inset',
})

const authStore = useAuthStore()
const { hasPermission, hasRole } = usePermissions()

const companyLink = computed(() => {
 if (authStore.userRole === 'master') return '/app/companies'
 if (authStore.companyId) return `/app/companies/${authStore.companyId}`
 return null
})

const data = {
 user: {
  name: 'User',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
 },
}

const navItems = computed(() => {
 const items = [
  { title: 'Big Deals', to: '/app', icon: Tags },
  { title: 'Price Check', to: '/app/price-check', icon: Euro },
  { title: 'Orders', to: '/app/orders', icon: ShoppingCart },
 ]

 if (companyLink.value) {
  items.push({
   title: hasRole('master') ? 'Companies' : 'Company',
   to: companyLink.value,
   icon: Building2,
  })
 }

 if (hasPermission('suppliers:read')) {
  items.push({ title: 'Suppliers', to: '/app/suppliers', icon: Truck })
 }

 if (hasRole('master')) {
  items.push({
   title: 'Master Products',
   to: '/app/masterProducts',
   icon: Package,
  })
 }

 if (hasPermission('users:read')) {
  items.push({ title: 'Users', to: '/app/users', icon: Users })
 }

 items.push({ title: 'Invoices', to: '#', icon: ReceiptText })

 return items
})
</script>

<template>
 <Sidebar v-bind="props">
  <SidebarHeader>
   <SidebarMenu>
    <SidebarMenuItem>
     <SidebarMenuButton
      size="lg"
      class="pointer-events-none"
      aria-label="Retail Ctrl"
     >
      <div
       class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
      >
       <Store class="size-4" />
      </div>
      <span
       class="truncate text-base font-semibold group-data-[collapsible=icon]:hidden"
      >
       Retail Ctrl
      </span>
     </SidebarMenuButton>
    </SidebarMenuItem>
   </SidebarMenu>
  </SidebarHeader>
  <SidebarContent>
   <NavFlat :items="navItems" />
  </SidebarContent>
  <SidebarFooter>
   <NavUser :user="data.user" />
  </SidebarFooter>
  <SidebarRail />
 </Sidebar>
</template>
