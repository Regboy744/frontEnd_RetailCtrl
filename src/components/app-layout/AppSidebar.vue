<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
 Settings2,
 Store,
 Euro,
 ReceiptText,
 Tags,
 Building2,
} from 'lucide-vue-next'
import NavMain from '@/components/app-layout/NavMain.vue'
import NavMaster from '@/components/app-layout/NavMaster.vue'
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
 navMain: [
  {
   title: 'Big Deals',
   to: '#',
   icon: Tags,
   isActive: true,
   items: [
    {
     title: 'Home',
     to: '/app',
    },
   ],
  },
  {
   title: 'Price Check',
   to: '#',
   icon: Euro,
   items: [
    {
     title: 'Savingbolos',
     to: '#',
    },
   ],
  },
  {
   title: 'Invoices',
   to: '#',
   icon: ReceiptText,
   items: [
    {
     title: 'Extractor',
     to: '#',
    },
   ],
  },
  {
   title: 'Settings',
   to: '#',
   icon: Settings2,
   items: [
    {
     title: 'General',
     to: '#',
    },
    {
     title: 'Team',
     to: '#',
    },
    {
     title: 'Billing',
     to: '#',
    },
    {
     title: 'Limits',
     to: '#',
    },
   ],
  },
 ],
 master: [
  {
   title: 'Companies',
   to: '#',
   icon: Building2,
   isActive: true,
   items: [
    {
     title: 'List',
     to: '/app/companies',
    },
   ],
  },
  {
   title: 'Price Check',
   to: '#',
   icon: Euro,
   items: [
    {
     title: 'Savingbolos',
     to: '#',
    },
   ],
  },
  {
   title: 'Invoices',
   to: '#',
   icon: ReceiptText,
   items: [
    {
     title: 'Extractor',
     to: '#',
    },
   ],
  },
  {
   title: 'Settings',
   to: '#',
   icon: Settings2,
   items: [
    {
     title: 'User Profile',
     to: '/app/users',
    },
   ],
  },
 ],
}
</script>

<template>
 <Sidebar v-bind="props">
  <SidebarHeader>
   <TeamSwitcher :stores="data.stores" />
  </SidebarHeader>
  <SidebarContent>
   <NavMain :navMain="data.navMain" />
   <NavMaster :navMaster="data.master" />
  </SidebarContent>
  <SidebarFooter>
   <NavUser :user="data.user" />
  </SidebarFooter>
  <SidebarRail />
 </Sidebar>
</template>
