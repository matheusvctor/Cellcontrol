# I Josh · Controle de Estoque

Sistema de gerenciamento de estoque para loja de celulares. Interface minimalista, intuitiva e focada em agilidade no dia a dia da loja.

## Funcionalidades

- **Dashboard** com visão geral:
  - Produtos cadastrados, valor em estoque e itens em alerta
  - Receita dos últimos 7 dias + ticket médio
  - Gráfico de vendas por dia (com variação vs ontem)
  - Entradas vs saídas por período
  - Ranking de produtos mais vendidos
  - Previsão de reposição (quanto pedir e valor estimado do pedido)
  - Estoque por categoria e últimas movimentações
- **Produtos**: cadastro, edição e exclusão com busca, filtros por marca e categoria, status automático (em estoque / baixo / esgotado)
- **Movimentações**: entradas e saídas com motivo, validação de saldo disponível e histórico filtrável
- **Tema claro/escuro** com preferência salva
- **Responsivo**: sidebar no desktop, navegação inferior no mobile
- **Persistência local**: dados salvos no navegador (localStorage)
- Dados de exemplo incluídos para testes

## Tecnologias

| Camada        | Stack                                   |
| ------------- | --------------------------------------- |
| Framework     | React 19                                |
| Build         | Vite 8                                  |
| Gráficos      | Recharts (carregado sob demanda - lazy) |
| Ícones        | lucide-react                            |
| Persistência  | localStorage                            |
| Lint          | oxlint                                  |

## Como rodar

```bash
npm install
npm run dev
```

Acesse o endereço indicado no terminal (padrão: `http://localhost:5173`).

## Scripts

| Comando         | Ação                         |
| --------------- | ---------------------------- |
| `npm run dev`   | Servidor de desenvolvimento  |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza build        |
| `npm run lint`  | Lint (oxlint)                |

## Estrutura

```
src/
├── App.jsx              # Layout, navegação e tema
├── components.jsx       # Modal, badges, toasts, empty states
├── palette.js           # Cores determinísticas por marca
├── store.js             # Estado + persistência (localStorage)
├── styles.css           # Design system e temas
└── views/
    ├── Dashboard.jsx        # Visão geral + KPIs
    ├── BestSellersChart.jsx # Gráfico de mais vendidos (lazy)
    ├── SalesCharts.jsx      # Vendas por período e fluxo (lazy)
    ├── Products.jsx         # CRUD de produtos
    └── Movements.jsx        # Entradas e saídas
```

## Modelo de dados

- **Produto**: `id, name, brand, category, price, quantity, minStock`
- **Movimentação**: `id, productId, productName, type (in|out), quantity, reason, date`

O estoque é atualizado automaticamente ao registrar uma movimentação. Saídas maiores que o saldo disponível são bloqueadas.

## Roadmap

- Back-end (API + banco de dados)
- Autenticação de funcionários
- Custo de compra por produto (margem e lucro bruto)
- Produtos parados (sem movimentação em 30+ dias)
- Relatório de vendas com períodos personalizados
- Exportação de dados (CSV)

## Licença

Uso interno — I Josh.