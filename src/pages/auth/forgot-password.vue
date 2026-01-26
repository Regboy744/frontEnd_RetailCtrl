<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
 AlertCircle,
 ArrowLeft,
 CheckCircle2,
 Loader2,
 Mail,
 ShoppingCart,
} from 'lucide-vue-next'

const {
 isLoading,
 validationErrors,
 sendPasswordReset,
 clearValidationErrors,
 sanitizeErrorMessage,
} = useAuth()

// Form state
const email = ref('')
const submitted = ref(false)
const localError = ref<string | null>(null)

// Combined error message
const displayError = computed(() => {
 if (localError.value) return sanitizeErrorMessage(localError.value)
 if (validationErrors.value.email) return validationErrors.value.email
 return null
})

// Handle form submission
const handleSubmit = async () => {
 localError.value = null
 clearValidationErrors()

 const result = await sendPasswordReset(email.value)

 if (result.success) {
  submitted.value = true
 } else if (result.error) {
  localError.value = result.error
 }
}

// Clear error when user starts typing
const handleInputChange = () => {
 if (localError.value) {
  localError.value = null
 }
 clearValidationErrors()
}

// Reset form to try again
const handleTryAgain = () => {
 submitted.value = false
 email.value = ''
 localError.value = null
 clearValidationErrors()
}
</script>

<template>
 <div
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12"
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
   <CardHeader class="space-y-4 text-center pb-2">
    <!-- Logo/Brand -->
    <div class="flex justify-center">
     <div class="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
      <ShoppingCart class="w-8 h-8 text-blue-400" />
     </div>
    </div>

    <div class="space-y-2">
     <CardTitle class="text-2xl font-bold text-white">
      {{ submitted ? 'Check your email' : 'Forgot password?' }}
     </CardTitle>
     <p class="text-slate-400 text-sm">
      {{
       submitted
        ? "We've sent you a password reset link"
        : "No worries, we'll send you reset instructions"
      }}
     </p>
    </div>
   </CardHeader>

   <CardContent class="space-y-6 pt-4">
    <!-- Success State -->
    <template v-if="submitted">
     <div class="flex flex-col items-center space-y-4 py-4">
      <div class="p-4 bg-green-500/10 rounded-full">
       <CheckCircle2 class="w-8 h-8 text-green-400" />
      </div>
      <div class="text-center space-y-2">
       <p class="text-slate-300">We've sent a password reset link to:</p>
       <p class="text-white font-medium">{{ email }}</p>
       <p class="text-slate-400 text-sm">
        Please check your inbox and spam folder.
       </p>
      </div>
     </div>

     <div class="space-y-3">
      <Button
       variant="outline"
       class="w-full border-slate-600 text-white hover:bg-slate-700"
       @click="handleTryAgain"
      >
       Try a different email
      </Button>

      <RouterLink to="/auth/login" class="block">
       <Button
        variant="ghost"
        class="w-full text-slate-400 hover:text-white hover:bg-slate-700"
       >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to login
       </Button>
      </RouterLink>
     </div>
    </template>

    <!-- Form State -->
    <template v-else>
     <!-- Error Message -->
     <div
      v-if="displayError"
      class="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
     >
      <AlertCircle class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div class="text-sm text-red-400">
       {{ displayError }}
      </div>
     </div>

     <!-- Reset Password Form -->
     <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email Field -->
      <div class="space-y-2">
       <Label for="email" class="text-slate-300">Email</Label>
       <div class="relative">
        <Mail
         class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        />
        <Input
         id="email"
         v-model="email"
         type="email"
         placeholder="you@example.com"
         autocomplete="email"
         :disabled="isLoading"
         :aria-invalid="!!validationErrors.email"
         class="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
         @input="handleInputChange"
        />
       </div>
      </div>

      <!-- Submit Button -->
      <Button
       type="submit"
       class="w-full bg-blue-600 hover:bg-blue-700 text-white"
       :disabled="isLoading || !email.trim()"
      >
       <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
       {{ isLoading ? 'Sending...' : 'Send reset link' }}
      </Button>
     </form>

     <!-- Back to Login -->
     <RouterLink to="/auth/login" class="block">
      <Button
       variant="ghost"
       class="w-full text-slate-400 hover:text-white hover:bg-slate-700"
      >
       <ArrowLeft class="w-4 h-4 mr-2" />
       Back to login
      </Button>
     </RouterLink>
    </template>
   </CardContent>
  </Card>
 </div>
</template>
