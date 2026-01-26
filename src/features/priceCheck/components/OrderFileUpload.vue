<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'
import { Upload, FileSpreadsheet, X, Loader2, Building2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabaseClient'

interface Company {
 id: string
 name: string
}

interface Props {
 isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
 upload: [data: { file: File; companyId: string }]
}>()

// State
const companies = ref<Company[]>([])
const selectedCompanyId = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const fileError = ref<string | null>(null)
const isLoadingCompanies = ref(false)

// Get dev company ID from environment
const devCompanyId = import.meta.env.VITE_DEV_COMPANY_ID || ''

// Computed
const canUpload = computed(() => {
 return selectedCompanyId.value && selectedFile.value && !fileError.value
})

const fileSizeFormatted = computed(() => {
 if (!selectedFile.value) return ''
 const bytes = selectedFile.value.size
 if (bytes < 1024) return `${bytes} B`
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

// Fetch companies on mount
onMounted(async () => {
 isLoadingCompanies.value = true
 try {
  const { data, error } = await supabase
   .from('companies')
   .select('id, name')
   .eq('is_active', true)
   .order('name', { ascending: true })

  if (error) throw error
  companies.value = data || []

  // Auto-select dev company if available
  if (devCompanyId && companies.value.some((c) => c.id === devCompanyId)) {
   selectedCompanyId.value = devCompanyId
  }
 } catch (err) {
  console.error('Failed to fetch companies:', err)
 } finally {
  isLoadingCompanies.value = false
 }
})

// File handling
const handleFileSelect = () => {
 fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
 const target = event.target as HTMLInputElement
 const file = target.files?.[0]

 if (!file) return

 // Validate file type
 const validTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 ]
 const validExtensions = ['.xls', '.xlsx']
 const hasValidExtension = validExtensions.some((ext) =>
  file.name.toLowerCase().endsWith(ext),
 )

 if (!validTypes.includes(file.type) && !hasValidExtension) {
  fileError.value = 'Please upload an XLS or XLSX file'
  selectedFile.value = null
  return
 }

 // Validate file size (max 10MB)
 const maxSize = 10 * 1024 * 1024
 if (file.size > maxSize) {
  fileError.value = 'File size must be less than 10MB'
  selectedFile.value = null
  return
 }

 fileError.value = null
 selectedFile.value = file
}

const handleRemoveFile = () => {
 selectedFile.value = null
 fileError.value = null
 if (fileInput.value) {
  fileInput.value.value = ''
 }
}

const handleUpload = () => {
 if (!canUpload.value || !selectedFile.value) return

 emit('upload', {
  file: selectedFile.value,
  companyId: selectedCompanyId.value,
 })
}

// Drag and drop
const isDragging = ref(false)

const handleDragOver = (event: DragEvent) => {
 event.preventDefault()
 isDragging.value = true
}

const handleDragLeave = () => {
 isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
 event.preventDefault()
 isDragging.value = false

 const file = event.dataTransfer?.files?.[0]
 if (file) {
  const mockEvent = {
   target: { files: [file] },
  } as unknown as Event
  handleFileChange(mockEvent)
 }
}
</script>

<template>
 <div class="space-y-5">
  <!-- Company Selection -->
  <div class="space-y-2">
   <label class="flex items-center gap-2 text-sm font-medium">
    <Building2 class="h-4 w-4 text-muted-foreground" />
    Company
   </label>
   <Select v-model="selectedCompanyId" :disabled="isLoadingCompanies">
    <SelectTrigger class="w-full">
     <SelectValue
      :placeholder="isLoadingCompanies ? 'Loading...' : 'Select company'"
     />
    </SelectTrigger>
    <SelectContent>
     <SelectGroup>
      <SelectItem
       v-for="company in companies"
       :key="company.id"
       :value="company.id"
      >
       {{ company.name }}
      </SelectItem>
     </SelectGroup>
    </SelectContent>
   </Select>
   <p class="text-xs text-muted-foreground">
    Prices will be compared using this company's negotiated rates
   </p>
  </div>

  <!-- Hidden File Input -->
  <input
   ref="fileInput"
   type="file"
   accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
   class="hidden"
   @change="handleFileChange"
  />

  <!-- Drop Zone / File Display -->
  <div
   class="relative border-2 border-dashed rounded-lg transition-all cursor-pointer"
   :class="[
    isDragging
     ? 'border-primary bg-primary/5'
     : fileError
       ? 'border-destructive/50 bg-destructive/5'
       : selectedFile
         ? 'border-primary/50 bg-primary/5'
         : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
   ]"
   @click="handleFileSelect"
   @dragover="handleDragOver"
   @dragleave="handleDragLeave"
   @drop="handleDrop"
  >
   <!-- No file selected -->
   <div v-if="!selectedFile" class="p-6 text-center">
    <Upload
     class="w-8 h-8 mx-auto mb-2"
     :class="isDragging ? 'text-primary' : 'text-muted-foreground'"
    />
    <p class="text-sm font-medium">
     {{ isDragging ? 'Drop file here' : 'Upload order file' }}
    </p>
    <p class="text-xs text-muted-foreground mt-1">XLS or XLSX, max 10MB</p>
   </div>

   <!-- File selected -->
   <div v-else class="p-4 flex items-center gap-3">
    <div class="p-2 bg-primary/10 rounded-lg shrink-0">
     <FileSpreadsheet class="h-5 w-5 text-primary" />
    </div>
    <div class="flex-1 min-w-0">
     <p class="text-sm font-medium truncate">{{ selectedFile.name }}</p>
     <p class="text-xs text-muted-foreground">{{ fileSizeFormatted }}</p>
    </div>
    <Button
     variant="ghost"
     size="icon"
     class="h-8 w-8 shrink-0"
     @click.stop="handleRemoveFile"
    >
     <X class="h-4 w-4" />
    </Button>
   </div>
  </div>

  <!-- File Error -->
  <p v-if="fileError" class="text-xs text-destructive">
   {{ fileError }}
  </p>

  <!-- Submit Button -->
  <Button
   class="w-full"
   size="lg"
   :disabled="!canUpload || isLoading"
   @click="handleUpload"
  >
   <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
   <Upload v-else class="mr-2 h-4 w-4" />
   {{ isLoading ? 'Checking Prices...' : 'Check Prices' }}
  </Button>
 </div>
</template>
