# SkillMatch Web

> Descubra o quanto seu perfil combina com as vagas de front-end júnior — e o que estudar para chegar lá.

## Sobre o projeto

O **SkillMatch Web** é a evolução do motor de compatibilidade criado no Mini-Projeto do Módulo 01 (que rodava apenas no console). Agora ele ganhou uma interface de verdade: uma aplicação web (Single Page) onde o candidato preenche seu próprio perfil, vê as vagas disponíveis com o percentual de compatibilidade calculado automaticamente e recebe uma recomendação de estudo baseada nas habilidades que mais faltam.

### Problema que resolve

Recrutadores e candidatos gastam tempo comparando manualmente os requisitos de uma vaga com o perfil de quem está se candidatando. O SkillMatch automatiza essa análise: a partir de um formulário simples, o sistema cruza as habilidades do candidato com o catálogo de vagas e mostra, de forma visual e imediata, qual vaga é mais compatível e o que precisa ser desenvolvido para melhorar essa compatibilidade.

## Funcionalidades

- Formulário de perfil (nome, área, habilidades e tempo de experiência) com validação acessível
- Catálogo de vagas carregado dinamicamente via `fetch` (`assets/dados/vagas.json`)
- Cálculo automático do percentual de compatibilidade por vaga (requisitos atendidos ÷ total × 100)
- Classificação das vagas em **Alta**, **Média** ou **Baixa** compatibilidade
- Destaque da vaga mais compatível + recomendação de estudo com base nas habilidades faltantes
- Cards de resultado gerados dinamicamente em JavaScript (nenhum HTML escrito à mão)
- Persistência do perfil entre visitas com `localStorage`
- Layout responsivo mobile-first (Flexbox)
- Tratamento dos três estados de rede: carregando, vazio e erro

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 semântico (landmarks, acessibilidade, SEO on-page) |
| Estilo | CSS3 puro (Flexbox, mobile-first, media queries) |
| Lógica | JavaScript (ES Modules) — sem frameworks, sem build |
| Dados | `fetch` + `async/await` + `localStorage` |
| Versionamento | Git + GitHub (branches `main` / `develop` / features) |
| Gestão de tarefas | Trello (Kanban) |

### Arquitetura de módulos

```
skillmatch-web/
├── index.html
├── README.md
└── assets/
    ├── styles/
    │   └── index.style.css
    ├── scripts/
    │   ├── main.js      # ponto de entrada (<script type="module">)
    │   ├── motor.js      # regras: classes Vaga / VagaFrontEnd, compatibilidade
    │   ├── ui.js         # tela: render dos cards, formulário, DOM/eventos
    │   └── dados.js      # fetch das vagas + localStorage
    ├── dados/
    │   └── vagas.json    # catálogo de vagas (carregado via fetch)
    └── img/
        └── logo.svg
```

Os três módulos seguem a divisão **dados × regras × tela**, orquestrados pelo `main.js`, e se comunicam por `import`/`export`.

## Como executar

### Acessar online

O projeto está publicado e pode ser acessado diretamente pelo link:

**https://ozdigitalweb.github.io/skillMatch-web/**

### Rodar localmente (opcional)

Este é um projeto **estático** (HTML + CSS + JS puro): não precisa de servidor de back-end nem de banco de dados. Porém, como usa módulos ES e `fetch`, ele **não funciona abrindo o arquivo diretamente** (`file://`) — é preciso rodar em um servidor local.

1. Clone o repositório:
```bash
   git clone <link-do-repositorio>
   cd skillmatch-web
```
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server** (se ainda não tiver).
4. Clique com o botão direito em `index.html` → **Open with Live Server**.
5. A aplicação abrirá em `http://127.0.0.1:5500` (ou porta similar).

> ⭐ Alternativa opcional: se o `package.json` estiver configurado, rode `npm install` e depois `npm start` para subir um servidor local via `live-server`.

## Fluxo de uso

1. Ao abrir a página, o formulário de perfil é exibido (ou o perfil salvo anteriormente é recuperado do `localStorage`).
2. O usuário preenche nome, área e habilidades.
3. Ao enviar, o motor compara o perfil com as vagas carregadas via `fetch`.
4. Os cards de resultado são renderizados, mostrando compatibilidade, classificação e habilidades encontradas/faltantes.
5. A vaga mais compatível é destacada com uma recomendação de estudo.
6. O perfil é salvo no `localStorage` para a próxima visita.

## 📋 Organização do projeto (Kanban)

O planejamento e o acompanhamento das tarefas foram feitos em um quadro Trello, organizado em backlog, premissas do projeto e colunas de fluxo (A Fazer → Em Progresso → Em Revisão → Concluído).

**Quadro Trello:** `https://trello.com/b/XuWI2NM3/skillmatch-web`

## Possíveis melhorias futuras

- Adicionar filtro e ordenação de vagas (por modalidade, salário ou compatibilidade)
- Implementar tema claro/escuro persistido no `localStorage`
- Usar a Geolocation API para contextualizar vagas por região
- Publicar o projeto no GitHub Pages
- Consumir uma API pública de vagas reais no lugar do `vagas.json` local

## Sobre o versionamento

O desenvolvimento seguiu o fluxo:

- `main` — código final, estável
- `develop` — integração das funcionalidades durante o desenvolvimento
- `feature/*` — uma branch por funcionalidade, a partir da `develop`

Commits seguem mensagens diretas e no modo imperativo (ex.: `implementa cálculo de compatibilidade`, `corrige validação do formulário`).

## Vídeo de demonstração

https://drive.google.com/drive/folders/13XypSuLi07uryoK53OZrgz5BoKzy3ePH?usp=sharing

## Uso de IA

Partes deste projeto contaram com apoio de IA (geração do catálogo de vagas fictícias, rascunho de funções e sugestões de acessibilidade/responsividade), sempre revisadas, adaptadas e validadas manualmente antes de entrarem no código final — nenhum trecho foi usado sem entendimento completo do que faz.

## Autor

Projeto individual desenvolvido Por Marcelo Krauthein Corrêa, como avaliação final do Módulo 01 — Front-End React, SENAI.
