<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { AlertTriangle, ChevronDown } from 'lucide-vue-next'

interface Props {
 articleCodes: string[]
}

const props = defineProps<Props>()

const isExpanded = ref(false)

// Show first 8 by default when collapsed
const visibleCodes = computed(() => {
 if (isExpanded.value) {
  return props.articleCodes
 }
 return props.articleCodes.slice(0, 8)
})

const hasMore = computed(() => props.articleCodes.length > 8)
const remainingCount = computed(() => props.articleCodes.length - 8)
</script>

<template>
 <Collapsible v-model:open="isExpanded">
  <div
   class="border border-amber-500/30 bg-amber-500/5 rounded-lg overflow-hidden"
  >
   <!-- Header -->
   <CollapsibleTrigger as-child>
    <button
     class="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-500/5 transition-colors text-left"
    >
     <div class="flex items-center gap-3">
      <AlertTriangle class="h-4 w-4 text-amber-500 shrink-0" />
      <div>
       <p class="text-sm font-medium text-amber-600">
        {{ articleCodes.length }} product{{
         articleCodes.length !== 1 ? 's' : ''
        }}
        not found
       </p>
       <p class="text-xs text-muted-foreground">
        These article codes are missing from the catalog
       </p>
      </div>
     </div>
     <ChevronDown
      class="h-4 w-4 text-muted-foreground transition-transform duration-200"
      :class="{ 'rotate-180': isExpanded }"
     />
    </button>
   </CollapsibleTrigger>

   <!-- Content -->
   <CollapsibleContent>
    <div class="px-4 pb-4 pt-1">
     <div class="flex flex-wrap gap-1.5">
      <span
       v-for="code in visibleCodes"
       :key="code"
       class="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700"
      >
       {{ code }}
      </span>
     </div>

     <!-- Show more button -->
     <Button
      v-if="hasMore && !isExpanded"
      variant="ghost"
      size="sm"
      class="mt-2 h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 px-2"
      @click.stop="isExpanded = true"
     >
      Show {{ remainingCount }} more
     </Button>
    </div>
   </CollapsibleContent>
  </div>
 </Collapsible>
</template>
