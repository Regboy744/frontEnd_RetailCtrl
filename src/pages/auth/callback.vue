<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('Processing authentication...')

onMounted(async () => {
 try {
  // Get the hash fragment from the URL (Supabase uses hash-based routing for auth)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const type = hashParams.get('type')

  // Also check query params for some flows
  const errorCode = route.query.error as string
  const errorDescription = route.query.error_description as string

  // Handle error from OAuth or email flow
  if (errorCode) {
   status.value = 'error'
   message.value =
    errorDescription || 'Authentication failed. Please try again.'
   setTimeout(() => {
    router.push('/auth/login')
   }, 3000)
   return
  }

  // Handle token-based callback (OAuth, magic link, etc.)
  if (accessToken && refreshToken) {
   const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
   })

   if (error) {
    status.value = 'error'
    message.value = error.message || 'Failed to establish session'
    setTimeout(() => {
     router.push('/auth/login')
    }, 3000)
    return
   }

   // Handle password recovery flow
   if (type === 'recovery') {
    status.value = 'success'
    message.value = 'Redirecting to password reset...'
    setTimeout(() => {
     router.push('/auth/reset-password')
    }, 1500)
    return
   }

   // Handle email confirmation
   if (type === 'signup' || type === 'email_change') {
    status.value = 'success'
    message.value = 'Email confirmed! Redirecting...'
    setTimeout(() => {
     router.push('/app')
    }, 1500)
    return
   }

   // Default: successful sign-in
   status.value = 'success'
   message.value = 'Authentication successful! Redirecting...'

   // Fetch user profile
   const { data: session } = await supabase.auth.getSession()
   if (session.session?.user) {
    await authStore.fetchUserProfile(session.session.user.id)
   }

   setTimeout(() => {
    router.push('/app')
   }, 1500)
   return
  }

  // No tokens in URL - check for existing session
  const {
   data: { session },
  } = await supabase.auth.getSession()

  if (session) {
   status.value = 'success'
   message.value = 'Already authenticated! Redirecting...'
   setTimeout(() => {
    router.push('/app')
   }, 1500)
  } else {
   status.value = 'error'
   message.value = 'No authentication data found. Redirecting to login...'
   setTimeout(() => {
    router.push('/auth/login')
   }, 2000)
  }
 } catch (err) {
  console.error('Auth callback error:', err)
  status.value = 'error'
  message.value = 'An unexpected error occurred. Please try again.'
  setTimeout(() => {
   router.push('/auth/login')
  }, 3000)
 }
})
</script>

<template>
 <div
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4"
 >
  <!-- Background decorations -->
  <div class="absolute inset-0 overflow-hidden">
   <div
    class="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
   ></div>
   <div
    class="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
   ></div>
  </div>

  <Card
   class="w-full max-w-md backdrop-blur-lg bg-slate-800/50 border-slate-700 relative z-10"
  >
   <CardContent
    class="flex flex-col items-center justify-center py-12 space-y-6"
   >
    <!-- Loading State -->
    <div
     v-if="status === 'loading'"
     class="flex flex-col items-center space-y-4"
    >
     <div class="p-4 bg-blue-500/10 rounded-full">
      <Loader2 class="w-8 h-8 text-blue-400 animate-spin" />
     </div>
     <p class="text-slate-300 text-center">{{ message }}</p>
    </div>

    <!-- Success State -->
    <div
     v-else-if="status === 'success'"
     class="flex flex-col items-center space-y-4"
    >
     <div class="p-4 bg-green-500/10 rounded-full">
      <CheckCircle2 class="w-8 h-8 text-green-400" />
     </div>
     <p class="text-green-400 text-center">{{ message }}</p>
    </div>

    <!-- Error State -->
    <div
     v-else-if="status === 'error'"
     class="flex flex-col items-center space-y-4"
    >
     <div class="p-4 bg-red-500/10 rounded-full">
      <XCircle class="w-8 h-8 text-red-400" />
     </div>
     <p class="text-red-400 text-center">{{ message }}</p>
     <RouterLink
      to="/auth/login"
      class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
     >
      Return to login
     </RouterLink>
    </div>
   </CardContent>
  </Card>
 </div>
</template>
