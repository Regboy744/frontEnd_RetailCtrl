<script setup lang="ts">
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
import TeamSwitcher from '@/components/app-layout/TeamSwitcher.vue'

import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarHeader,
 SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
 collapsible: 'icon',
 variant: 'inset',
})

const data = {
 user: {
  name: 'User',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
 },
 stores: [
  {
   name: 'Rialto Store',
   logo: Store,
   number: '441',
  },
  {
   name: 'Charlemont St',
   logo: Store,
   number: 'Startup',
  },
  {
   name: 'Point Campus',
   logo: Store,
   number: '1074',
  },
 ],
 navItems: [
  { title: 'Big Deals', to: '/app', icon: Tags },
  { title: 'Price Check', to: '/app/price-check', icon: Euro },
  { title: 'Orders', to: '/app/orders', icon: ShoppingCart },
  { title: 'Companies', to: '/app/companies', icon: Building2 },
  { title: 'Suppliers', to: '/app/suppliers', icon: Truck },
  { title: 'Master Products', to: '/app/masterProducts', icon: Package },
  { title: 'Users', to: '/app/users', icon: Users },
  { title: 'Invoices', to: '#', icon: ReceiptText },
 ],
}
</script>

<template>
 <Sidebar v-bind="props">
  <SidebarHeader>
   <TeamSwitcher :stores="data.stores" />
  </SidebarHeader>
  <SidebarContent>
   <NavFlat :items="data.navItems" />
  </SidebarContent>
  <SidebarFooter>
   <NavUser :user="data.user" />
  </SidebarFooter>
  <SidebarRail />
 </Sidebar>
</template>
