<script setup lang="ts">
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/vue-table'
import { Icon } from '#components'

import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'

import { parseISO } from 'date-fns'
import { ref } from 'vue'
import Button from '~/components/Shadcn/Button/Button.vue'
import { useToast } from '~/components/Shadcn/Toast'

interface DataItem {
  id: string
  name: string
  lat: number
  lon: number
  createdAt: Date
  deletedAt: Date
}

function handleSortingArrow(order: string | boolean) {
  if (order === 'asc')
    return 'lucide:arrow-up'
  if (order === 'desc')
    return 'lucide:arrow-down'
  return 'lucide:arrow-up-down'
}

const columns: ColumnDef<DataItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h('div', { class: 'flex items-center' }, [
        h('span', {}, 'Nome'),
        h(Button, {
          variant: 'ghost',
          class: 'ml-2 h-8 w-8 p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => h(Icon, { name: handleSortingArrow(column.getIsSorted()), class: 'h-4 w-4' })),
      ])
    },
  },
  {
    accessorKey: 'lat',
    header: ({ column }) => {
      return h('div', { class: 'flex items-center' }, [
        h('span', {}, 'Latitude'),
        h(Button, {
          variant: 'ghost',
          class: 'ml-2 h-8 w-8 p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => h(Icon, { name: handleSortingArrow(column.getIsSorted()), class: 'h-4 w-4' })),
      ])
    },
  },
  {
    accessorKey: 'lon',
    header: ({ column }) => {
      return h('div', { class: 'flex items-center' }, [
        h('span', {}, 'Longitude'),
        h(Button, {
          variant: 'ghost',
          class: 'ml-2 h-8 w-8 p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => h(Icon, { name: handleSortingArrow(column.getIsSorted()), class: 'h-4 w-4' })),
      ])
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return h('div', { class: 'flex items-center' }, [
        h('span', {}, 'Criado em'),
        h(Button, {
          variant: 'ghost',
          class: 'ml-2 h-8 w-8 p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => h(Icon, { name: handleSortingArrow(column.getIsSorted()), class: 'h-4 w-4' })),
      ])
    },
    cell: ({ row }) => {
      return formatDateLong(parseISO(row.getValue('createdAt')))
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return h('div', { class: 'flex items-center' }, [
        h('span', {}, 'Atualizado em'),
        h(Button, {
          variant: 'ghost',
          class: 'ml-2 h-8 w-8 p-0',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => h(Icon, { name: handleSortingArrow(column.getIsSorted()), class: 'h-4 w-4' })),
      ])
    },
    cell: ({ row }) => {
      return formatDateLong(parseISO(row.getValue('updatedAt')))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          variant: 'destructive',
          size: 'sm',
          onClick: () => handleDelete(row.original.id),
        }, () => 'Deletar'),
      ])
    },
  },
]

const data = ref<DataItem[]>([])
const selectedId = ref<string | null>(null)
const selectedData = computed(() => data.value.find(item => item.id === selectedId.value))

// const isEditing = ref(false)
const isCreating = ref(false)
const isDeleting = ref(false)
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

const { toast } = useToast()

const table = useVueTable({
  get data() { return data.value },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: (updaterOrValue) => {
    sorting.value = typeof updaterOrValue === 'function'
      ? updaterOrValue(sorting.value)
      : updaterOrValue
  },
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value = typeof updaterOrValue === 'function'
      ? updaterOrValue(columnFilters.value)
      : updaterOrValue
  },
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
  },
})

function toggleCreating() {
  isCreating.value = !isCreating.value
}

function closeCreating() {
  isCreating.value = false
}

// function toggleEditing() {
//   isEditing.value = !isEditing.value
// }

function toggleDeleting() {
  isDeleting.value = !isDeleting.value
}

function closeDeleting() {
  isDeleting.value = false
}

function handleDelete(id: string) {
  selectedId.value = id
  toggleDeleting()
}

async function confirmDelete(id: string) {
  try {
    await $fetch(`/api/rhyme-battles/${id}`, {
      method: 'DELETE',
    })
    data.value = data.value.filter(item => item.id !== id)
    toast({
      title: 'Batalha deletada com sucesso!',
    })
  }
  catch {
    toast({
      title: 'Erro ao deletar a batalha, por favor tente novamente!',
    })
  }
  finally {
    toggleDeleting()
    selectedId.value = null
  }
}

async function confirmCreate() {
  data.value = await getData()
  toggleCreating()
}

// function handleEdit(item: DataItem) {
//   isEditing.value = true
// }

async function getData() {
  const response = await $fetch('/api/rhyme-battles')
  return response.data
}

onMounted(async () => {
  data.value = await getData()
})
</script>

<template>
  <div class="p-10">
    <NuxtLink custom to="/" external>
      <template #default="{ navigate }">
        <Button variant="outline" class="mb-4 grow-0 mr-auto px-3" @click="navigate">
          <Icon name="lucide:arrow-left" class="mr-1.5 h-4 w-4" /> <span>Voltar</span>
        </Button>
      </template>
    </NuxtLink>

    <h1>Gerenciar Batalhas</h1>
    <div class="flex items-center py-4 gap-4">
      <Input
        placeholder="Buscar por nome"
        class="max-w-xs"
        :model-value="table.getColumn('name')?.getFilterValue() as string"
        @update:model-value="table.getColumn('name')?.setFilterValue($event)"
      />
      <Button variant="secondary" @click="toggleCreating">
        Inserir batalha
      </Button>
    </div>

    <Dialog :open="isCreating" @update:open="closeCreating">
      <DialogContent @open-auto-focus.prevent>
        <DialogHeader>
          <DialogTitle>Inserir batalha</DialogTitle>
        </DialogHeader>
        <CreateBattleForm @submit="confirmCreate" />
      </DialogContent>
    </Dialog>

    <!-- <Dialog :open="isEditing">
      <DialogContent @open-auto-focus.prevent>
        <DialogHeader>
          <DialogTitle>Inserir batalha</DialogTitle>

        <CreateBattleForm />
      </DialogContent>
    </Dialog> -->

    <Dialog :open="isDeleting" @update:open="closeDeleting">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar batalha</DialogTitle>
        </DialogHeader>
        <span>Tem certeza que deseja deletar <b>"{{ selectedData?.name }}"</b> ?</span> <span class="font-bold">Esta ação não poderá ser desfeita!</span>
        <DialogFooter class="gap-2">
          <Button type="button" variant="outline" @click="toggleDeleting">
            Cancelar
          </Button>
          <Button type="button" variant="destructive" @click="() => confirmDelete(selectedId!)">
            Deletar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                Nenhum resultado.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <Icon name="lucide:arrow-big-left-dash" class="w-6 h-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <Icon name="lucide:arrow-big-right-dash" class="w-6 h-6" />
      </Button>
    </div>
  </div>
</template>
