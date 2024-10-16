// export default defineEventHandler(
//   async (event) => {
//     const storage = useStorage('images')
//     // storage.setItemRaw('clandestina031reserva:test.jpeg')
//     const meta = await storage.getMeta('clandestina031reserva:DAa4l9YxnzU.jpeg')
//     const data = await storage.getItemRaw('clandestina031reserva:DAa4l9YxnzU.jpeg')
//     console.log({meta, data})
//     if (!data)
//       return {}
//     setHeader(event, 'Content-Type', 'image/jpeg')
//     setHeaders(event, {
//       'Content-Type': 'image/jpeg',
//       'Content-Length': meta.size,
//     })
//     return data
//   },
// )
