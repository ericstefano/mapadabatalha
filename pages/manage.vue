<script setup lang="ts">
import { useToast } from '@/components/Shadcn/Toast/use-toast'
import { toTypedSchema } from '@vee-validate/valibot'
import { parseURL, withoutLeadingSlash, withoutTrailingSlash } from 'ufo'
import * as v from 'valibot'
import { configure, useForm } from 'vee-validate'
import { ACCEPTED_IMAGE_FILE_EXTENSIONS, ACCEPTED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE } from '~/constants'

function withoutSlashes(url: string) {
  return withoutLeadingSlash(withoutTrailingSlash(url))
}

const profileStringSchema = v.pipe(
  v.string('Por favor, preencha o campo de Instagram.'),
  v.startsWith('@', 'Por favor, insira uma URL válida ou um perfil válido.'),
  v.transform(value => value.replaceAll('@', '')),
)
const profileUrlSchema = v.pipe(
  v.string('Por favor, preencha o campo de Instagram.'),
  v.includes('.instagram.com', 'Por favor, insira uma URL válida ou um perfil válido.'),
  v.custom((check) => {
    if (typeof check !== 'string')
      return false
    const pathname = withoutSlashes(parseURL(check).pathname)
    return Boolean(pathname) && pathname.split('/').length === 1
  }, 'Por favor, insira uma URL válida ou um perfil válido.'),
  v.transform((value) => {
    return withoutSlashes(parseURL(value).pathname)
  }),
)
const profileSchema = v.pipe(v.union([profileStringSchema, profileUrlSchema], 'Por favor, preencha o campo de Instagram.'), v.trim())

const coordinatesStringSchema = v.pipe(
  v.string('Por favor, preencha o campo de coordenadas.'),
  v.custom((check) => {
    if (typeof check !== 'string')
      return false
    const split = check.split(',')
    if (split.length !== 2)
      return false
    if (Number.isNaN(Number.parseFloat(split[0])) || Number.isNaN(Number.parseFloat(split[1])))
      return false
    return true
  }, 'Por favor, insira a URL com coordenadas ou as coordenadas no formato válido latitude,longitude.'),
  v.transform((value) => {
    const split = value.trim().split(',')
    return { lat: Number.parseFloat(split[0]), lon: Number.parseFloat(split[1]) }
  }),
)
const coordinatesUrlSchema = v.pipe(
  v.string('Por favor, preencha o campo de coordenadas.'),
  v.includes('google.com', 'Por favor, insira a URL com coordenadas ou as coordenadas no formato válido latitude,longitude.'),
  v.includes('/maps', 'Por favor, insira a URL com coordenadas ou as coordenadas no formato válido latitude,longitude.'),
  v.custom((check) => {
    if (typeof check !== 'string')
      return false
    const pathname = withoutSlashes(parseURL(check.trim()).pathname)
    if (!pathname)
      return false
    const split = pathname.trim().replaceAll('@', '').split('/')
    const latLon = split[1]
    const splitLatLon = latLon.split(',')
    if (splitLatLon.length < 2)
      return false
    if (Number.isNaN(Number.parseFloat(splitLatLon[0])) || Number.isNaN(Number.parseFloat(splitLatLon[1])))
      return false
    return true
  }, 'Por favor, insira a URL com coordenadas ou as coordenadas no formato válido latitude,longitude.'),
  v.transform((value) => {
    const pathname = withoutSlashes(parseURL(value.trim().replaceAll('@', '')).pathname)
    const splitPathname = pathname.split('/')
    const latLon = splitPathname[1]
    const splitLatLon = latLon.split(',')
    return { lat: Number.parseFloat(splitLatLon[0]), lon: Number.parseFloat(splitLatLon[1]) }
  }),
)

const imageSchema = v.pipe(
  v.instance(File, 'Por favor, insira uma imagem.'),
  v.mimeType(
    ACCEPTED_IMAGE_MIME_TYPES,
    'Por favor, selecione um arquivo de imagem.',
  ),
  v.maxSize(
    MAX_IMAGE_FILE_SIZE,
    'Por favor, selecione uma imagem menor que 5 MB.',
  ),
  v.check((file) => {
    return ACCEPTED_IMAGE_FILE_EXTENSIONS.includes(
      getFileExtension(file.name),
    )
  }, 'Por favor, selecione um arquivo de imagem.'),
)

const latLonSchema = v.union([coordinatesStringSchema, coordinatesUrlSchema], 'Por favor, insira a URL com coordenadas ou as coordenadas no formato válido latitude,longitude.')

const fields = {
  name: v.pipe(v.string('Por favor, preencha o campo de nome.'), v.trim()),
  instagram: profileSchema,
  coordinates: latLonSchema,
  image: imageSchema,
}

const schema = v.object(fields)
const formSchema = toTypedSchema(schema)

configure({
  bails: true,
})

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const { toast } = useToast()

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    name: values.name,
    instagram: values.instagram,
    lat: values.coordinates.lat,
    lon: values.coordinates.lon,
    // weekDay: values.weekDay,
    // startTime: values.startTime,
    image: await fileToBase64(values.image),
  }
  // console.log(payload)
  try {
    await $fetch('/api/rhyme-battles', {
      method: 'POST',
      body: payload,
    })
    toast({
      title: 'Batalha criada com sucesso!',
      duration: 4000,
    })
  }
  catch {
    toast({
      title: 'Erro ao criar a batalha, por favor tente novamente!',
      variant: 'destructive',
      duration: 4000,
    })
  }
})
</script>

<template>
  <div class="min-h-screen w-screen flex flex-col justify-center items-center">
    <Toaster />
    <Card class="w-full max-w-[32rem]">
      <CardHeader>
        <CardTitle>
          Adicionar Nova Batalha de Rima
        </CardTitle>
        <CardDescription>Preencha as informações para colocar a batalha no Mapa</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField, errorMessage }" name="name">
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da batalha." :error="!!errorMessage" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField, errorMessage }" name="instagram">
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input placeholder="Digite o perfil do Instagram da batalha." :error="!!errorMessage" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField, errorMessage }" name="coordinates">
            <FormItem>
              <FormLabel>Coordenadas</FormLabel>
              <FormControl>
                <Input placeholder="Digite as coordenadas da batalha." :error="!!errorMessage" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ errorMessage, field }" name="image" type="file">
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input type="file" v-bind="field" :error="!!errorMessage" :accept="ACCEPTED_IMAGE_MIME_TYPES.join(',')" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="flex justify-end">
            <Button type="submit">
              Enviar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
