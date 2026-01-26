<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SheetClose } from '@/components/ui/sheet'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import {
 Loader2,
 Plus,
 RefreshCw,
 AlertTriangle,
 Minus,
 X,
} from 'lucide-vue-next'
import type {
 CsvPreviewData,
 UpsertProgress,
} from '@/features/masterProducts/types'

interface Props {
 previewData: CsvPreviewData
 isApplying?: boolean
 uploadProgress?: UpsertProgress | null
}

defineProps<Props>()

const emit = defineEmits<{
 apply: []
 back: []
 cancel: []
}>()

// Get status badge variant
const getStatusBadge = (status: string) => {
 switch (status) {
  case 'new':
   return { variant: 'default' as const, class: 'bg-green-500', icon: Plus }
  case 'updated':
   return { variant: 'default' as const, class: 'bg-blue-500', icon: RefreshCw }
  case 'ean_changed':
   return {
    variant: 'default' as const,
    class: 'bg-amber-500',
    icon: AlertTriangle,
   }
  case 'unchanged':
   return { variant: 'secondary' as const, class: '', icon: Minus }
  default:
   return { variant: 'secondary' as const, class: '', icon: Minus }
 }
}

const formatStatus = (status: string) => {
 switch (status) {
  case 'new':
   return 'New'
  case 'updated':
   return 'Update'
  case 'ean_changed':
   return 'EAN Changed'
  case 'unchanged':
   return 'No Change'
  default:
   return status
 }
}
</script>

<template>
 <div class="space-y-6 px-4">
  <!-- Summary -->
  <div class="space-y-3">
   <div class="flex items-center gap-2">
    <span
     class="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
    >
     Import Preview for {{ previewData.brandName }}
    </span>
    <div class="flex-1 border-t border-border"></div>
   </div>

   <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
    <div class="bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
     <p class="text-2xl font-bold">{{ previewData.summary.total }}</p>
     <p class="text-xs text-muted-foreground">Total</p>
    </div>
    <div
     class="bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-center"
    >
     <p class="text-2xl font-bold text-green-500">
      {{ previewData.summary.new }}
     </p>
     <p class="text-xs text-muted-foreground">New</p>
    </div>
    <div
     class="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30 text-center"
    >
     <p class="text-2xl font-bold text-blue-500">
      {{ previewData.summary.updated }}
     </p>
     <p class="text-xs text-muted-foreground">Updated</p>
    </div>
    <div
     class="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 text-center"
    >
     <p class="text-2xl font-bold text-amber-500">
      {{ previewData.summary.eanChanged }}
     </p>
     <p class="text-xs text-muted-foreground">EAN Changed</p>
    </div>
    <div class="bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
     <p class="text-2xl font-bold text-muted-foreground">
      {{ previewData.summary.unchanged }}
     </p>
     <p class="text-xs text-muted-foreground">Unchanged</p>
    </div>
   </div>
  </div>

  <!-- Preview Table -->
  <div class="space-y-3">
   <div class="flex items-center gap-2">
    <span
     class="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
    >
     Changes Detail
    </span>
    <div class="flex-1 border-t border-border"></div>
   </div>

   <div class="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
    <div class="max-h-96 overflow-y-auto">
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead class="w-24">Status</TableHead>
        <TableHead>Article Code</TableHead>
        <TableHead>EAN Code</TableHead>
        <TableHead>Description</TableHead>
        <TableHead class="w-48">Changes</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       <TableRow
        v-for="(item, index) in previewData.items.slice(0, 100)"
        :key="index"
        :class="{
         'bg-green-500/5': item.status === 'new',
         'bg-blue-500/5': item.status === 'updated',
         'bg-amber-500/5': item.status === 'ean_changed',
        }"
       >
        <TableCell>
         <Badge
          :variant="getStatusBadge(item.status).variant"
          :class="getStatusBadge(item.status).class"
          class="text-xs"
         >
          {{ formatStatus(item.status) }}
         </Badge>
        </TableCell>
        <TableCell class="font-mono text-xs">{{ item.article_code }}</TableCell>
        <TableCell class="font-mono text-xs">{{ item.ean_code }}</TableCell>
        <TableCell class="max-w-48 truncate">{{ item.description }}</TableCell>
        <TableCell class="text-xs text-muted-foreground">
         <span v-if="item.changes && item.changes.length > 0">
          {{ item.changes.join(', ') }}
         </span>
         <span v-else-if="item.status === 'new'" class="text-green-500">
          New product
         </span>
         <span v-else class="text-muted-foreground">-</span>
        </TableCell>
       </TableRow>
      </TableBody>
     </Table>
    </div>

    <div
     v-if="previewData.items.length > 100"
     class="p-3 text-center text-sm text-muted-foreground border-t"
    >
     Showing first 100 of {{ previewData.items.length }} items
    </div>
   </div>
  </div>

  <!-- Info about EAN history -->
  <div
   v-if="previewData.summary.eanChanged > 0"
   class="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30"
  >
   <p class="text-sm font-medium text-amber-500">EAN Code Changes Detected</p>
   <p class="text-xs text-muted-foreground mt-1">
    {{ previewData.summary.eanChanged }} product(s) have different EAN codes.
    The old EAN codes will be saved in the product's history for reference.
   </p>
  </div>

  <!-- Upload Progress -->
  <div
   v-if="uploadProgress"
   class="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 space-y-3"
  >
   <div class="flex items-center justify-between">
    <div>
     <p class="text-sm font-medium text-blue-500">
      {{ uploadProgress.message }}
     </p>
     <p class="text-xs text-muted-foreground mt-1">
      {{ uploadProgress.current }} / {{ uploadProgress.total }}
      <span v-if="uploadProgress.total > 0">
       ({{
        Math.round((uploadProgress.current / uploadProgress.total) * 100)
       }}%)
      </span>
     </p>
    </div>
    <Button
     variant="ghost"
     size="sm"
     class="text-destructive hover:text-destructive"
     @click="emit('cancel')"
    >
     <X class="h-4 w-4" />
    </Button>
   </div>

   <!-- Progress Bar -->
   <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
    <div
     class="bg-blue-500 h-full transition-all duration-300 ease-out"
     :style="{
      width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`,
     }"
    ></div>
   </div>

   <!-- Phase indicator -->
   <div class="flex items-center gap-2 text-xs text-muted-foreground">
    <span
     class="px-2 py-1 rounded-md"
     :class="{
      'bg-green-500/20 text-green-500': uploadProgress.phase === 'fetching',
      'bg-blue-500/20 text-blue-500': uploadProgress.phase === 'processing',
      'bg-purple-500/20 text-purple-500': uploadProgress.phase === 'inserting',
      'bg-amber-500/20 text-amber-500': uploadProgress.phase === 'updating',
      'bg-emerald-500/20 text-emerald-500': uploadProgress.phase === 'complete',
     }"
    >
     {{ uploadProgress.phase.toUpperCase() }}
    </span>
   </div>
  </div>

  <!-- Submit Actions -->
  <div
   class="sticky bottom-0 pt-6 pb-6 -mx-4 px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t"
  >
   <div class="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
    <Button
     variant="outline"
     type="button"
     class="w-full sm:w-35"
     :disabled="isApplying || !!uploadProgress"
     @click="emit('back')"
    >
     Back
    </Button>
    <SheetClose v-if="!uploadProgress" as-child>
     <Button
      type="button"
      class="w-full sm:w-45"
      :disabled="
       isApplying ||
       !!uploadProgress ||
       (previewData.summary.new === 0 &&
        previewData.summary.updated === 0 &&
        previewData.summary.eanChanged === 0)
      "
      @click="emit('apply')"
     >
      <Loader2 v-if="isApplying" class="mr-2 h-4 w-4 animate-spin" />
      {{
       isApplying
        ? 'Applying...'
        : `Apply ${previewData.summary.new + previewData.summary.updated + previewData.summary.eanChanged} Changes`
      }}
     </Button>
    </SheetClose>
    <Button
     v-else
     variant="destructive"
     type="button"
     class="w-full sm:w-45"
     @click="emit('cancel')"
    >
     <X class="mr-2 h-4 w-4" />
     Cancel Upload
    </Button>
   </div>
  </div>
 </div>
</template>
