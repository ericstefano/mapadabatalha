export default defineTask({
  meta: {
    name: 'scheduled:test',
    description: 'Testing',
  },
  async run({ payload, context, name }) {
    // Fazer um cronjob para:
    // * Extrair postagens das batalhas
    // * Fazer análise de postagens
    // * Soft Deletar análises expiradas
    //
    // Fazer isso criando endpoints no backend que realizam essas tarefas
    // Também deve ser possível utilizar essas endpoints no FrontEnd
    // Como decidir qual batalha deve ter as postagens extraídas e as postagens analisadas?
    // console.log({ context, name, payload })
    // const data = await $fetch('/api/instagram-posts')
    // console.log(data)
    const response = await $fetch('/api/health-check')
    console.log(response)
    return { result: 'success' }
  },
})
