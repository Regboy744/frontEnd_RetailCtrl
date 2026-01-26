<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
 BadgeCheck,
 Bell,
 ChevronsUpDown,
 CreditCard,
 LogOut,
 Sparkles,
 Shield,
} from 'lucide-vue-next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { isMobile } = useSidebar()

// User data from auth store
const userName = computed(() => authStore.userFullName)
const userEmail = computed(() => authStore.userEmail)
const userAvatar = computed(() => authStore.userAvatar)
const userInitials = computed(() => authStore.userInitials)
const userRole = computed(() => authStore.userRole)

// Role badge styling
const roleBadgeClass = computed(() => {
 switch (userRole.value) {
  case 'master':
   return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  case 'admin':
   return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  case 'manager':
   return 'bg-green-500/10 text-green-400 border-green-500/20'
  default:
   return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
 }
})

// Handle logout
const handleLogout = async () => {
 await authStore.signOut()
 router.push('/auth/login')
}

// Navigate to account settings
const handleAccount = () => {
 router.push('/app/settings/account')
}

// Navigate to billing
const handleBilling = () => {
 router.push('/app/settings/billing')
}

// Navigate to notifications
const handleNotifications = () => {
 router.push('/app/settings/notifications')
}

// Navigate to upgrade/billing
const handleUpgrade = () => {
 router.push('/app/settings/billing')
}
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
      <Avatar class="h-8 w-8 rounded-lg">
       <AvatarImage :src="userAvatar" :alt="userName" />
       <AvatarFallback class="rounded-lg bg-blue-500/10 text-blue-400">
        {{ userInitials }}
       </AvatarFallback>
      </Avatar>
      <div class="grid flex-1 text-left text-sm leading-tight">
       <span class="truncate font-medium">{{ userName }}</span>
       <span class="truncate text-xs text-muted-foreground">{{
        userEmail
       }}</span>
      </div>
      <ChevronsUpDown class="ml-auto size-4" />
     </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
     class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
     :side="isMobile ? 'bottom' : 'right'"
     align="end"
     :side-offset="4"
    >
     <DropdownMenuLabel class="p-0 font-normal">
      <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
       <Avatar class="h-8 w-8 rounded-lg">
        <AvatarImage :src="userAvatar" :alt="userName" />
        <AvatarFallback class="rounded-lg bg-blue-500/10 text-blue-400">
         {{ userInitials }}
        </AvatarFallback>
       </Avatar>
       <div class="grid flex-1 text-left text-sm leading-tight">
        <div class="flex items-center gap-2">
         <span class="truncate font-semibold">{{ userName }}</span>
         <Badge
          v-if="userRole"
          variant="outline"
          class="text-[10px] px-1.5 py-0 h-4 capitalize"
          :class="roleBadgeClass"
         >
          <Shield class="w-2.5 h-2.5 mr-0.5" />
          {{ userRole }}
         </Badge>
        </div>
        <span class="truncate text-xs text-muted-foreground">{{
         userEmail
        }}</span>
       </div>
      </div>
     </DropdownMenuLabel>
     <DropdownMenuSeparator />
     <DropdownMenuGroup>
      <DropdownMenuItem class="cursor-pointer" @click="handleUpgrade">
       <Sparkles class="mr-2 h-4 w-4" />
       Upgrade to Pro
      </DropdownMenuItem>
     </DropdownMenuGroup>
     <DropdownMenuSeparator />
     <DropdownMenuGroup>
      <DropdownMenuItem class="cursor-pointer" @click="handleAccount">
       <BadgeCheck class="mr-2 h-4 w-4" />
       Account
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="handleBilling">
       <CreditCard class="mr-2 h-4 w-4" />
       Billing
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @click="handleNotifications">
       <Bell class="mr-2 h-4 w-4" />
       Notifications
      </DropdownMenuItem>
     </DropdownMenuGroup>
     <DropdownMenuSeparator />
     <DropdownMenuItem
      class="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
      @click="handleLogout"
     >
      <LogOut class="mr-2 h-4 w-4" />
      Log out
     </DropdownMenuItem>
    </DropdownMenuContent>
   </DropdownMenu>
  </SidebarMenuItem>
 </SidebarMenu>
</template>
