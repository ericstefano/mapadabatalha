# Mapa da Batalha

Sistema web para extrair e visualizar informações de batalhas de rima a partir de imagens compartilhadas no Instagram utilizando web scraping e LLM multimodal.

![Arquitetura](/docs/presentation/assets/arquitetura-atualizada.png)

## 🚀 Funcionalidades

- Extração automatizada de posts do Instagram
- Identificação de flyers usando Llama 3.2 90B Vision
- Extração de data, hora e local dos eventos
- Visualização em mapa interativo
- Interface responsiva e intuitiva

## 💻 Tecnologias

- Node.js
- TypeScript
- Vue.js/Nuxt.js
- SQLite
- MapLibre/Maptiler
- TailwindCSS
- Crawlee
- Playwright

## 📷 Fotos

![Interface do Sistema](/docs/presentation/assets/sistema-marcadores.png)
![Interface do Sistema - Aproximado](/docs/presentation/assets/sistema-marcadores-zoom.png)
![Interface do Sistema - Carregando](/docs/presentation/assets/sistema-carregando.png)
![Interface do Sistema - Detalhes](/docs/presentation/assets/sistema-detalhes.png)
![Interface do Sistema - Gerenciar](/docs/presentation/assets/sistema-gerenciamento.png)

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mapadabatalha

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Execute o projeto
npm run dev
```

## 📝 Licença

Este projeto está sob a licença [AGPL-3.0](LICENSE).

## 📊 Resultados

- Acurácia na identificação de flyers: 52,4%
- Precisão na extração de informações: 73,3%

![Métricas de Desempenho - Identificação](/docs/presentation/assets/resultados-identificacao.png)
![Métricas de Desempenho - Extração](/docs/presentation/assets/resultados-extracao.png)
