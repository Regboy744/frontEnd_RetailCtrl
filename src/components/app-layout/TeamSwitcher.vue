<script setup lang="ts">
import type { Component } from 'vue'

import { ChevronsUpDown } from 'lucide-vue-next'
import { ref } from 'vue'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuShortcut,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from '@/components/ui/sidebar'

const props = defineProps<{
 stores: {
  name: string
  logo: Component
  number: string
 }[]
}>()

const { isMobile } = useSidebar()
const activeStores = ref(props.stores[0])
</script>

<template>
 <SidebarMenu>
  <SidebarMenuItem>
   <DropdownMenu>
    <DropdownMenuTrigger as-child>
     <SidebarMenuButton
      size="lg"
      class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
     >
      <div
       class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
      >
       <component :is="activeStores.logo" class="size-4" />
      </div>
      <div class="grid flex-1 text-left text-sm leading-tight">
       <span class="truncate font-medium">
        {{ activeStores.name }}
       </span>
       <span class="truncate text-xs">{{ activeStores.number }}</span>
      </div>
      <ChevronsUpDown class="ml-auto" />
     </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
     class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
     align="start"
     :side="isMobile ? 'bottom' : 'right'"
     :side-offset="4"
    >
     <DropdownMenuLabel class="text-xs text-muted-foreground">
      Stores
     </DropdownMenuLabel>
     <DropdownMenuItem
      v-for="(store, index) in stores"
      :key="store.name"
      class="gap-2 p-2"
      @click="activeStores = store"
     >
      <div class="flex size-6 items-center justify-center rounded-sm border">
       <component :is="store.logo" class="size-3.5 shrink-0" />
      </div>
      {{ store.name }}
      <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
     </DropdownMenuItem>
     <!-- <DropdownMenuSeparator /> -->
     <!-- <DropdownMenuItem class="gap-2 p-2"> -->
     <!--  <div -->
     <!--   class="flex size-6 items-center justify-center rounded-md border bg-transparent" -->
     <!--  > -->
     <!--   <Plus class="size-4" /> -->
     <!--  </div> -->
     <!--  <div class="font-medium text-muted-foreground">Add team</div> -->
     <!-- </DropdownMenuItem> -->
    </DropdownMenuContent>
   </DropdownMenu>
  </SidebarMenuItem>
 </SidebarMenu>
</template>
