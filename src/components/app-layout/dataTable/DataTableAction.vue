<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
 SheetDescription,
} from '@/components/ui/sheet'
import { Pencil, Trash } from 'lucide-vue-next'

interface Props {
 row: {
  id: string
  [key: string]: unknown
 }
}

const props = defineProps<Props>()

const isEditOpen = ref<boolean>(false)

const { id, name, phone } = props.row

const handleDelete = () => console.log('Delete :', id)

const handleSave = () => (isEditOpen.value = false)
</script>

<template>
 <!-- Edit with Sheet -->
 <Sheet v-model:open="isEditOpen">
  <SheetTrigger as-child>
   <Button variant="ghost" class="w-8 h-8 p-0">
    <Pencil class="w-4 h-4" />
   </Button>
  </SheetTrigger>

  <SheetContent>
   <SheetHeader>
    <SheetTitle>Edit {{ name }}</SheetTitle>
    <SheetDescription>
     Make changes to {{ name }} and save it
     <br />
     Make changes to {{ phone }} and save it
    </SheetDescription>
   </SheetHeader>

   <!-- Edit form here using row data -->
   <form @submit.prevent="handleSave">
    <!-- Your inputs -->
   </form>
  </SheetContent>
 </Sheet>

 <!-- Delete -->
 <Button variant="ghost" class="w-8 h-8 p-0" @click="handleDelete">
  <Trash class="w-4 h-4" />
 </Button>
</template>
