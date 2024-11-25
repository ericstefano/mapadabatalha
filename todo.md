[] Arrumar timestamps (fazer ser data, utilizar timezone brasileira ou fazer transformação)
[] Bugs com ssr
[x] Bug com devtools -> apertar shift + alt + d
[] bug com o Drawer, scrollando ao "clicar" no botão de ver mais postagens
[x] bug com o pg, "sorry, too many clients already"
[] Melhorar geradores de ID
[] Cadastro de Batalhas (com imagem de perfil)
[] Renomear Shadcn para shadcn -> não funciona?
[x] Parâmetros/state de url para abrir batalhas
[] Páginação das postagens do Instagram -> usar Cursor
[x] Ordenação por data das postagens do Instagram
[x] Links nos Detalhes da Batalha
[x] Variáveis de ambiente dinâmicas
[] Storage dinâmico (docker)
[] Tratamento de imagem que não encontra caminho.
[o] Tratamento de erro com cookies expirados (ERR_TOO_MANY_REDIRECTS)
[x] Rodar método de unmount/ destroy / disconnect do drizzle ou pg em algum hook do nuxt para evitar "TOO MANY COnnections"
[] Adicionar referência do Rolê nas Gerais do Viaduto Santa Tereza.

[] Juntar Drawer e Sheet no RhymeBattleInfo (para evitar refetch).
[x] Criar Carrousel para as análises.
[x] Criar aviso (warning) sobre as análises.
[x] Criar "escondedor" de análises inválidas.
[x] Tratar datas na exibição das análises (passado/futuro)
[x] Adicionar ícones próximo aos títulos (Postagens/Análises) para ao mesmo tempo mostrar o carregamento, e quando terminar, ser um tooltip com o tempo que demorou para carregar, ou simplesmente erro.

<!-- [] Criar timer para datas futuras. -->

[] Criar perfil no Instagram privado para fazer testes e análises
[] Soft delete das postagens / análises (?)
[] Análise qualitativa com matriz de confusão, verificar com orientador.
[] Perguntar ao modelo se a imagem se trata de um flyer ou não antes de entrar no fluxo de extração.
[] Considerar cronjob (será possível com o Nuxt Events).
[] Adicionar splash screen antes do carregamento do mapa.
[] Considerar proxy (?)
[x] Mudar hieraquia visual, postagens devem ser menores que as análises
[x] Transformar postagens em carousel também

<!-- [] Várias contas do Instagram -->

[] Link pro Google Maps Street View junto ao título da batalha no header


[x] Mudar para Sqlite (?)
[o] Não salvar urls na tabela, montar elas no front (?)
[] Mudar do maptiler para https://openfreemap.org/

[] Fazer um webhook no email para enviar código do Instagram para logar no scraper quando os cookies da sessão expirarem (tratamento de erro).
Usar o próprio perfil do Instagram como teste para ver se o scraper está com a sessão expirada.
Basta verificar se carrega e se o botão tem o texto "seguir" ou "seguindo".

[] Análise qualitativa primeiro, antes do frontend.
[] Criar prompt para identificar se é flyer ou não antes de fazer a análise.
[] Cadastrar várias batalhas (mostrar o sistema versão completa).
[x] Mandar data da postagem ao invés do ano atual no prompt de usuário.
[] Matriz de confusão para identificação de flyer (sim ou não e falsos positivos).
[] Matriz de confusão deve ser para as DUAS partes do prompt.
OU
[] Taxa de acerto / taxa de erro -> Montar um bom critério aleatório para recolher as postagens (ex: recolher postagens de vários locais em um período), fazer classificação visual e manual.
[] Buckets R2 ou cloudinary

Extração:
Priorizar perfil com data de extração de postagem mais antiga (createdAt) e com menor quantidade postagens.

Análise:
Priorizar perfil com data de análise mais antiga e com menor quantidade de análises NÃO DELETADAS

Não fazer análises de postagens que já tenham análises, mesmo análises DELETADAS.
Soft deletar todas as análises ao fazer novas análises (post endpoint).
Definir melhor um critério para soft deletar as análises e refaze-las.

Ao buscar as análises, retornar somente análises que deleteAt seja NULL.

Aprender sobre medidas anti-scraping ->
https://docs.apify.com/academy/anti-scraping

Rodar requisição para fazer identificação da postagem antes de mandar pa análise (É flyer ou NÃO é flyer).

Nova tabela para guardar identificações da postagem.

Se fizer uma identificação de postagem, e a reposta for NÃO.
NÃO pode fazer análise dessa postagem.

Nesse caso deve salvar a identificação, e não deve salvar a análise pois ela não será feita.

Pro FrontEnd essa tabela é irrelevante.
Essa tabela vai ser útil para a análise qualitativa.
Para a análise qualitativa funcionar, eu preciso fazer análise de uma quantidade de postagens, então devo fazer SCRAPING de todas as postagens da batalha para ter espaço para fazer análise.

\*Criar nova tabela "postIdentifications"

\*Criar nova endpoint que recebe o id da batalha para fazer uma nova requisição com prompt para o LLM para indetificar se a imagem se trata de um flyer de anúncio (true ou false) e salvar essa identificação na tabela. Se NÃO for um flyer segundo essa identificação, ele NÃO faz a análise (não roda a endpoint

\*Não preciso adicionar soft delete para as análises de batalha SE eu retornar somente as três análises mais recentes.

\*Criar outra endpoint de análise de postagens para ser por id de postagem ao invés de para batalha de rima e usar para a endpoint de análises de batalha de rima essa nova endpoint.

\*Considerar apagar as colunas isActive, weekDay, startTime

<!-- Tentei, porém ficou esquisito e travado por conta do render do mapa -->
<!-- [] Tamanho dinâmico dos modais -> alinhamento do marcador ao centro  -->
