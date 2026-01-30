# PRD - Sistema de Gerenciamento de Academia (MVP)

## 1. Visão Geral

### 1.1 Objetivo
Desenvolver um sistema web para gerenciar confirmações de pagamento e matrículas de alunos em aulas de academia, com controle de presença e agendamentos automáticos.

### 1.2 Usuário
- **Único usuário**: Dono da academia (admin)
- Acesso via autenticação web

### 1.3 Tecnologias
- **Frontend/Backend**: Next.js 16 (App Router, Server Components)
- **Autenticação**: NextAuth.js
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL
- **Deploy**: GitHub Actions + VPS (servidor ARM) com Portainer, Traefik e Docker Swarm. Postgres já instalado no servidor (fora do stack da aplicação em produção).
- **Ambiente local**: Docker Compose para desenvolvimento (app + Postgres em container).
- **Ambiente produção**: Docker Compose (ou stack Swarm) apenas com a aplicação; conexão com Postgres existente no servidor.
- **UI**: shadcn/ui + Tailwind CSS

### 1.4 Decisões técnicas e premissas
- **Server Actions vs API Routes**: Mutations e formulários usam **Server Actions**. Route Handlers em `/app/api/cron/...` para jobs invocados por cron externo (GitHub Actions scheduled) ou por node-cron dentro do container em produção (VPS é long-running).
- **Jobs**: Em produção (VPS), jobs podem rodar via **GitHub Actions scheduled workflows** (chamando `/api/cron/...` com CRON_SECRET) ou **node-cron** dentro do container.
- **Timezone**: Horários dos jobs e noção de "dia atual" / "hoje" usam o timezone **America/Sao_Paulo**. Configurar no ambiente (ex.: `TZ=America/Sao_Paulo`) e nas funções de data.
- **Dia de vencimento 31**: Aceitar 1 a 31; para meses com menos de 31 dias, dia 31 significa o último dia do mês (ex.: 31/02 → 28 ou 29).
- **Unicidade de agendamentos**: Um único agendamento por combinação `(aula_id, aluno_id, data, horario)`. Na geração (job), usar verificação de existência ou constraint única para evitar duplicatas.

---

## 2. Funcionalidades do MVP

### 2.1 Gestão de Planos
- Criar planos (Individual ou Coletivo)
- Definir valor da mensalidade por plano
- Listar e editar planos

### 2.2 Gestão de Aulas
- Criar aulas (ex: Boxe, Muay Thai, etc)
- Definir horário e dias da semana (ex: 05:30, Seg/Qua/Sex)
- Listar e editar aulas
- Vincular aulas a planos

### 2.3 Gestão de Alunos
- Criar aluno com: nome, telefone (WhatsApp), status
- Listar e editar alunos
- Visualizar histórico de pagamentos e presença

### 2.4 Gestão de Matrículas
- Matricular aluno ao criar/editar cadastro
- Selecionar plano (Individual/Coletivo)
- Vincular aluno às aulas do plano
- Definir dia de vencimento (1 a 31; dia 31 = último dia do mês quando o mês tiver menos de 31 dias)
- Definir horários específicos para cada aula vinculada buscar dos dados da aula

### 2.5 Gestão de Pagamentos
- Gerar automaticamente lançamentos mensais (todo dia 1º do mês)
- Confirmar recebimento com valor (pré-preenchido, editável)
- Registrar data de pagamento
- Visualizar histórico de pagamentos por aluno
- Dashboard de inadimplência

### 2.6 Gestão de Agendamentos
- Gerar automaticamente agendamentos diários baseados nas matrículas
- Listar agendamentos do dia/semana
- Confirmar presença do aluno
- Adicionar/remover alunos pontualmente de uma aula
- Visualizar ocupação de cada aula

### 2.7 Alteração de Horários
- Permitir mudança de horários de aulas de um aluno
- Ao alterar horários na matrícula:
  - Atualizar agendamentos do dia atual até o próximo vencimento
  - Manter histórico de agendamentos passados inalterado

---

## 3. Modelo de Dados

### 3.1 Entidades Principais

#### `users` (Autenticação)
```
- id (UUID)
- email (string, unique)
- password_hash (string)
- name (string)
- created_at (timestamp)
```

#### `planos`
```
- id (UUID)
- nome (string) - ex: "Individual", "Coletivo"
- tipo (enum: INDIVIDUAL, COLETIVO)
- valor (decimal)
- qtd_dias (integer) default 3
- ativo (boolean)
- created_at (timestamp)
```

#### `aulas`
```
- id (UUID)
- nome (string) - ex: "Boxe", "Muay Thai"
- dias_semana (array) - ex: [1, 3, 5] (seg, qua, sex)
- horario (time) - ex: "05:30:00"
- duracao_minutos (integer) - ex: 60
- capacidade_maxima (integer)
- ativo (boolean)
- created_at (timestamp)
```

#### `planos_aulas` (relacionamento N:N)
```
- id (UUID)
- plano_id (UUID, FK)
- aula_id (UUID, FK)
```

#### `alunos`
```
- id (UUID)
- nome (string)
- telefone (string) - formato: +55 71 99999-9999
- email (string, nullable)
- status (enum: ATIVO, INATIVO, SUSPENSO)
- created_at (timestamp)
```

#### `matriculas`
```
- id (UUID)
- aluno_id (UUID, FK)
- plano_id (UUID, FK)
- dia_vencimento (integer) - 1 a 31 (dia 31 = último dia do mês quando o mês tiver menos de 31 dias)
- data_inicio (date)
- data_fim (date, nullable)
- status (enum: ATIVA, CANCELADA, SUSPENSA)
- created_at (timestamp)
```

#### `matriculas_aulas` (horários específicos do aluno)
```
- id (UUID)
- matricula_id (UUID, FK)
- aula_id (UUID, FK)
- horario (time, nullable) - se diferente da aula padrão
- dias_semana (array, nullable)
- ativo (boolean)
- created_at (timestamp)
```

#### `pagamentos`
```
- id (UUID)
- matricula_id (UUID, FK)
- valor_esperado (decimal)
- valor_pago (decimal, nullable)
- mes_referencia (date) - primeiro dia do mês
- data_vencimento (date)
- data_pagamento (date, nullable)
- status (enum: PENDENTE, PAGO, ATRASADO, CANCELADO)
- observacoes (text, nullable)
- created_at (timestamp)
```

#### `agendamentos`
```
- id (UUID)
- aula_id (UUID, FK)
- aluno_id (UUID, FK)
- matricula_id (UUID, FK)
- data (date)
- horario (time)
- status (enum: AGENDADO, PRESENTE, AUSENTE, CANCELADO)
- tipo (enum: AUTOMATICO, MANUAL) - se foi gerado pelo sistema ou adicionado manualmente
- created_at (timestamp)
- updated_at (timestamp)
```

### 3.2 Relacionamentos
- Um `plano` tem muitas `aulas` (N:N via `planos_aulas`)
- Um `aluno` tem muitas `matriculas` (1:N)
- Uma `matricula` pertence a um `plano` e um `aluno`
- Uma `matricula` tem muitos `pagamentos` (1:N)
- Uma `matricula` tem muitas `matriculas_aulas` (1:N)
- Um `agendamento` pertence a uma `aula`, `aluno` e `matricula`

---

## 4. Regras de Negócio

### 4.1 Matrículas
1. Ao criar matrícula, vincular automaticamente todas as aulas do plano escolhido
2. Gerar primeiro pagamento imediatamente após criação
3. Aluno pode ter apenas UMA matrícula ATIVA por vez
4. Data de início da matrícula = data do cadastro
5. Na edição do aluno: apenas a matrícula ativa pode ser alterada (dados, horários). Troca de plano implica encerrar a matrícula atual (`data_fim` = hoje, status = CANCELADA) e criar nova matrícula automaticamente.

### 4.2 Pagamentos
1. Gerar lançamentos mensais automaticamente (JOB: todo dia 1º às 00:00, timezone America/Sao_Paulo)
2. Para cada matrícula ATIVA, criar pagamento do mês seguinte
3. Valor esperado = valor do plano na data de geração
4. Data de vencimento = dia escolhido na matrícula do mês de referência (dia 31 na matrícula → último dia do mês quando o mês tiver menos de 31 dias)
5. Status inicial = PENDENTE
6. Ao confirmar: registrar valor pago, data de pagamento, status = PAGO
7. Atualizar automaticamente para ATRASADO se data_vencimento < hoje e status = PENDENTE

### 4.3 Agendamentos
1. Gerar agendamentos automaticamente (JOB: diário às 00:00, timezone America/Sao_Paulo)
2. Para cada matrícula ATIVA:
   - Verificar dias da semana de cada aula vinculada
   - Se dia de hoje corresponde, criar agendamento
3. Gerar agendamentos para os próximos 7 dias
4. **Unicidade**: Um único agendamento por combinação (aula_id, aluno_id, data, horario). Na geração, verificar existência ou usar constraint única para evitar duplicatas.
5. Ao confirmar presença: status = PRESENTE
6. Ao final do dia, agendamentos não confirmados = AUSENTE (JOB: às 23:59, timezone America/Sao_Paulo)
7. Permitir adicionar aluno manualmente (tipo = MANUAL)
8. Permitir remover agendamento (status = CANCELADO)

### 4.4 Alteração de Horários
1. Admin altera horários em `matriculas_aulas`
2. Sistema valida conflitos: não permitir dois agendamentos do mesmo aluno no mesmo dia e horário (ex.: duas aulas sobrepostas).
3. Sistema identifica período: data atual até próximo vencimento
4. Deletar agendamentos AGENDADOS neste período
5. Recriar agendamentos com novos horários/dias
6. Manter agendamentos com status PRESENTE, AUSENTE, CANCELADO

### 4.5 Dashboard e Indicadores
1. Total de alunos ativos
2. Pagamentos pendentes do mês
3. Taxa de presença mensal/semanal
4. Inadimplência (pagamentos atrasados)
5. Ocupação de aulas (hoje)

---

## 5. Fluxos Principais

### 5.1 Fluxo de Cadastro de Aluno (Completo)
```
1. Admin acessa "Novo Aluno"
2. Preenche: nome, telefone
3. Seleciona plano (lista planos ativos)
4. Seleciona aulas disponíveis no plano
5. Para cada aula, define horário (usa padrão ou customiza)
6. Define dia de vencimento (1-31)
7. Sistema salva:
   - Aluno (status = ATIVO)
   - Matrícula (status = ATIVA, data_inicio = hoje)
   - Matriculas_aulas (uma para cada aula selecionada)
   - Pagamento do mês atual (status = PENDENTE)
8. Sistema gera agendamentos para os próximos 7 dias
9. Redireciona para perfil do aluno
```

### 5.2 Fluxo de Confirmação de Pagamento
```
1. Admin acessa "Pagamentos Pendentes"
2. Visualiza lista filtrada por mês
3. Clica em "Confirmar" em um pagamento
4. Sistema abre modal com:
   - Valor esperado (pré-preenchido)
   - Data de pagamento (pré-preenchida com hoje)
   - Campo editável para valor pago
   - Campo de observações
5. Admin confirma
6. Sistema atualiza:
   - Status = PAGO
   - Valor_pago
   - Data_pagamento
7. Atualiza lista
```

### 5.3 Fluxo de Controle de Presença
```
1. Admin acessa "Agendamentos de Hoje"
2. Visualiza lista agrupada por horário/aula
3. Para cada aluno listado:
   - Checkbox "Presente"
   - Botão "Ausente"
4. Admin marca presenças
5. Sistema atualiza status dos agendamentos em tempo real
6. Estatísticas da aula atualizam automaticamente
```

### 5.4 Fluxo de Alteração de Horários
```
1. Admin acessa perfil do aluno
2. Clica em "Editar Horários"
3. Visualiza aulas matriculadas
4. Altera horário/dias de uma ou mais aulas
5. Sistema valida conflitos
6. Admin confirma alteração
7. Sistema:
   - Atualiza matriculas_aulas
   - Busca próxima data de vencimento
   - Deleta agendamentos AGENDADOS entre hoje e vencimento
   - Recria agendamentos com novos horários
8. Exibe mensagem de sucesso com total de agendamentos atualizados
```

---

## 6. Interface do Usuário (Telas)
- Todo o webapp deve ser responsivo e voltado para o mobile pois será um pwa
### 6.1 Autenticação
- `/login` - Formulário de login (email + senha)

### 6.2 Dashboard
- `/dashboard` - Visão geral com cards:
  - Total de alunos ativos
  - Pagamentos pendentes (valor total)
  - Agendamentos do dia
  - Taxa de presença do mês

### 6.3 Planos
- `/planos` - Lista de planos (tabela)
- `/planos/novo` - Formulário de criação
- `/planos/[id]/editar` - Formulário de edição

### 6.4 Aulas
- `/aulas` - Lista de aulas (tabela)
- `/aulas/novo` - Formulário de criação (com seletor de dias e horário)
- `/aulas/[id]/editar` - Formulário de edição

### 6.5 Alunos
- `/alunos` - Lista de alunos (tabela com filtros)
- `/alunos/novo` - Formulário completo (dados + matrícula + aulas)
- `/alunos/[id]` - Perfil do aluno:
  - Dados pessoais
  - Matrícula ativa
  - Aulas e horários (com botão "Editar Horários")
  - Histórico de pagamentos
  - Histórico de presença (últimos 30 dias)

### 6.6 Pagamentos
- `/pagamentos` - Lista de pagamentos:
  - Filtros: mês, status, aluno
  - Ações: confirmar, editar, visualizar
- `/pagamentos/[id]` - Detalhes do pagamento

### 6.7 Agendamentos
- `/agendamentos` - Visão de agendamentos:
  - Filtro por data (padrão: hoje)
  - Agrupado por horário/aula
  - Lista de alunos com checkbox de presença
  - Botões: adicionar aluno, remover aluno
- `/agendamentos/semana` - Visão semanal (grid)

---

## 7. Jobs e Automações

**Premissa (produção em VPS)**: Os jobs rodam via (1) **GitHub Actions scheduled workflows** que chamam as rotas `/api/cron/...` com `CRON_SECRET`, ou (2) **node-cron** dentro do container da aplicação. **Timezone**: America/Sao_Paulo.

### 7.1 Geração de Pagamentos Mensais
- **Frequência**: Todo dia 1º do mês às 00:00 (America/Sao_Paulo)
- **Ação**: Para cada matrícula ATIVA, criar pagamento do mês seguinte
- **Tecnologia**: GitHub Actions cron (`0 0 1 * *`) chamando `/api/cron/gerar-pagamentos`, ou node-cron no container

### 7.2 Geração de Agendamentos
- **Frequência**: Diariamente às 00:00 (America/Sao_Paulo)
- **Ação**: Gerar agendamentos para os próximos 7 dias baseado em matrículas ativas
- **Lógica**: Verificar dias da semana e criar apenas se não existir (unicidade: aula_id + aluno_id + data + horario)
- **Tecnologia**: GitHub Actions cron (`0 0 * * *`) chamando `/api/cron/gerar-agendamentos`, ou node-cron no container

### 7.3 Atualização de Status de Presença
- **Frequência**: Diariamente às 23:59 (America/Sao_Paulo)
- **Ação**: Marcar agendamentos do dia com status AGENDADO como AUSENTE
- **Tecnologia**: GitHub Actions cron ou node-cron no container

### 7.4 Atualização de Status de Pagamento
- **Frequência**: Diariamente às 06:00 (America/Sao_Paulo)
- **Ação**: Marcar pagamentos PENDENTES com data_vencimento < hoje como ATRASADO
- **Tecnologia**: GitHub Actions cron ou node-cron no container

---

## 8. Padrão de CRUD (referência para implementação)

Os CRUDs do sistema seguem um **padrão único** baseado na implementação de **Planos**. A estrutura (queries → schemas → services → actions → componentes → páginas), contratos de retorno, validação Zod, Server Actions e layout mobile-first estão descritos em:

- **[.cursor/docs/CRUD-PATTERN.md](.cursor/docs/CRUD-PATTERN.md)** — Padrão de CRUD (base: Planos)

Use esse documento como base para Aulas, Alunos, Pagamentos, Agendamentos e demais entidades. As fases abaixo indicam *o quê* implementar; o *como* (estrutura de arquivos, assinaturas, retornos e UI) segue o CRUD-PATTERN.

---

## 9. Steps de Implementação (Ordem de Execução)

### **FASE 1: Setup do Projeto (1-2 dias)**

#### Step 1.1: Inicializar Projeto Next.js
```bash
npx create-next-app@latest academia-mvp --typescript --tailwind --app
cd academia-mvp
```
- Configurar ESLint e Prettier
- Estrutura de pastas

#### Step 1.2: Configurar Banco de Dados
- **Desenvolvimento**: Usar Docker Compose (`docker-compose.dev.yml`) com Postgres em container; connection string em `.env.local` (ex.: `DATABASE_URL=postgresql://user:pass@localhost:5432/boxeapp`).
- **Produção**: Postgres já existe no servidor; configurar `DATABASE_URL` no ambiente da VPS (ou no Portainer/stack).

#### Step 1.3: Instalar Dependências
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install next-auth
npm install @hookform/resolvers react-hook-form zod
npm install date-fns
npm install lucide-react
```

#### Step 1.4: Configurar Drizzle ORM
- Criar `drizzle.config.ts`
- Criar `/db/index.ts`
- Configurar scripts no `package.json`

#### Step 1.5: Instalar shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card table form
npx shadcn-ui@latest add select checkbox calendar badge
npx shadcn-ui@latest add dropdown-menu dialog alert
```

---

### **FASE 2: Schema e Autenticação (2 dias)**

#### Step 2.1: Criar Schema Drizzle
- Criar `/db/schema.ts` com todas as tabelas
- Definir relações entre entidades
- Exportar tipos TypeScript

#### Step 2.2: Gerar e Executar Migrations
```bash
npm run db:generate
npm run db:migrate
```

#### Step 2.3: Criar Seeds (Dados Iniciais)
- Script para criar usuário admin
- Hash de senha com bcrypt
- Executar seeds

#### Step 2.4: Configurar NextAuth
- Criar `/app/api/auth/[...nextauth]/route.ts`
- Configurar Credentials Provider
- Criar middleware de autenticação
- Criar `/auth.ts` com funções auxiliares

#### Step 2.5: Criar Tela de Login
- Criar `/app/login/page.tsx`
- Formulário com validação (react-hook-form + zod)
- Lógica de autenticação

---

### **FASE 3: CRUD de Planos (1-2 dias)**

*Padrão técnico: [CRUD-PATTERN.md](.cursor/docs/CRUD-PATTERN.md).*

#### Step 3.1: Criar Queries Drizzle (Planos)
- Criar `src/db/queries/planos.ts`
- Funções: getAll, getById, create, update, delete

#### Step 3.2: Criar Server Actions (Planos)
- Server Actions para create, update, delete (formulários); ver CRUD-PATTERN para assinaturas e retorno.

#### Step 3.3: Criar Páginas (Planos)
- `src/app/(dashboard)/planos/page.tsx` - Lista (Server Component)
- `src/app/(dashboard)/planos/novo/page.tsx` - Criar
- `src/app/(dashboard)/planos/[id]/editar/page.tsx` - Editar

#### Step 3.4: Criar Componentes (Planos)
- `PlanosList` - Cards (mobile) + tabela (desktop); touch-friendly (min-h 44px)
- `PlanoForm` - Formulário reutilizável (react-hook-form + zod)
- `PlanosListWrapper` - Lista + dialog de confirmação de exclusão

---

### **FASE 4: CRUD de Aulas (1-2 dias)**

*Seguir [CRUD-PATTERN.md](.cursor/docs/CRUD-PATTERN.md); incluir vínculo planos-aulas conforme seção 9.*

#### Step 4.1: Criar Queries Drizzle (Aulas)
- Criar `src/db/queries/aulas.ts`
- Funções: getAll, getById, getByPlanoId, create, update, delete; setAulasDoPlano para vínculo N:N

#### Step 4.2: Criar Server Actions (Aulas)
- Server Actions para create, update, delete de aulas (formulários)
- Preferir Server Actions; Route Handlers em `/app/api/...` apenas se necessário para consumo externo

#### Step 4.3: Criar Páginas (Aulas)
- `/app/(dashboard)/aulas/page.tsx`
- `/app/(dashboard)/aulas/novo/page.tsx`
- `/app/(dashboard)/aulas/[id]/editar/page.tsx`

#### Step 4.4: Criar Componentes (Aulas)
- `AulasList` - Tabela
- `AulaForm` - Formulário com seletor de dias e horário
- Componente `DiasSemanaSelector` (checkboxes)
- Componente `HorarioInput` (time picker)

#### Step 4.5: Implementar Vínculo Planos-Aulas
- Adicionar seleção de aulas no formulário de planos
- Atualizar queries para incluir relacionamento

---

### **FASE 5: CRUD de Alunos e Matrículas (3-4 dias)**

#### Step 5.1: Criar Queries Drizzle (Alunos)
- Criar `db/queries/alunos.ts`
- Incluir queries complexas (com matrícula, pagamentos, presença)

#### Step 5.2: Criar Queries Drizzle (Matrículas)
- Criar `db/queries/matriculas.ts`
- Função para criar matrícula completa (transação)

#### Step 5.3: Criar Server Actions (Alunos)
- Server Actions para CRUD de alunos e matrícula (formulários de cadastro e perfil)
- Preferir Server Actions; Route Handlers apenas se necessário para consumo externo

#### Step 5.4: Criar Página de Listagem
- `/app/(dashboard)/alunos/page.tsx`
- Tabela com filtros (status, nome, telefone)
- Ações: ver perfil, editar, desativar

#### Step 5.5: Criar Formulário de Cadastro Completo
- `/app/(dashboard)/alunos/novo/page.tsx`
- **Seção 1**: Dados pessoais
- **Seção 2**: Seleção de plano
- **Seção 3**: Seleção de aulas e horários (multi-step)
- **Seção 4**: Dia de vencimento
- Validação e preview antes de salvar

#### Step 5.6: Criar Perfil do Aluno
- `/app/(dashboard)/alunos/[id]/page.tsx`
- Tabs:
  - Dados e Matrícula
  - Pagamentos
  - Presença
- Botão "Editar Horários"

#### Step 5.7: Implementar Lógica de Criação
- Criar transação para salvar:
  - Aluno
  - Matrícula
  - Matriculas_aulas
  - Pagamento inicial
  - Agendamentos (próximos 7 dias)

---

### **FASE 6: Gestão de Pagamentos (2-3 dias)**

#### Step 6.1: Criar Queries Drizzle (Pagamentos)
- Criar `/db/queries/pagamentos.ts`
- Queries: pendentes, por mês, por aluno, confirmar

#### Step 6.2: Criar Server Actions (Pagamentos)
- Server Actions para listar (com filtros) e confirmar pagamento (modal)
- Dados de listagem podem vir de Server Components + Server Actions ou de uma action de busca

#### Step 6.3: Criar Página de Pagamentos
- `/app/(dashboard)/pagamentos/page.tsx`
- Filtros: mês, status, aluno
- Tabela com informações do aluno e matrícula
- Ação: "Confirmar Pagamento"

#### Step 6.4: Criar Modal de Confirmação
- Componente `ConfirmarPagamentoDialog`
- Campos: valor (editável), data, observações
- Submit com atualização da lista

#### Step 6.5: Criar Indicadores no Dashboard
- Card "Pagamentos Pendentes" com valor total
- Card "Taxa de Inadimplência"
- Gráfico de pagamentos do mês (opcional)

---

### **FASE 7: Gestão de Agendamentos (3-4 dias)**

#### Step 7.1: Criar Queries Drizzle (Agendamentos)
- Criar `/db/queries/agendamentos.ts`
- Query para agendamentos do dia (agrupados por aula)
- Query para agendamentos da semana
- Funções: marcarPresenca, adicionar, remover

#### Step 7.2: Criar Server Actions (Agendamentos)
- Server Actions para listar (com filtro de data), marcar presença, adicionar e remover aluno de aula
- Preferir Server Actions para todas as mutations; listagem pode ser Server Component + action de busca

#### Step 7.3: Criar Página de Agendamentos do Dia
- `/app/(dashboard)/agendamentos/page.tsx`
- Filtro de data (padrão: hoje)
- Lista agrupada por horário/aula
- Para cada aula:
  - Horário e nome da aula
  - Lista de alunos com checkbox de presença
  - Botões: adicionar aluno, ver detalhes

#### Step 7.4: Criar Componentes de Agendamento
- `AgendamentoCard` - Card de uma aula
- `AlunoPresencaItem` - Item com checkbox
- `AdicionarAlunoDialog` - Modal para adicionar aluno manualmente

#### Step 7.5: Implementar Controle de Presença
- Checkbox com atualização instantânea
- Indicador visual de status (presente/ausente)
- Contadores de presença por aula

#### Step 7.6: Criar Visão Semanal (Opcional)
- `/app/(dashboard)/agendamentos/semana/page.tsx`
- Grid com dias da semana e horários
- Visualização de ocupação

---

### **FASE 8: Alteração de Horários (2 dias)**

#### Step 8.1: Criar Lógica de Alteração
- Criar `/services/alteracao-horarios.ts`
- Função principal: `alterarHorariosMatricula()`
- Lógica:
  1. Buscar próxima data de vencimento
  2. Deletar agendamentos AGENDADOS (data atual -> vencimento)
  3. Recriar agendamentos com novos horários

#### Step 8.2: Criar Server Action
- Server Action `alterarHorariosMatricula(alunoId, novosHorarios)`
- Receber novos horários, executar lógica em transação
- Retornar total de agendamentos afetados (para feedback na UI)

#### Step 8.3: Criar Interface de Edição
- Componente `EditarHorariosDialog`
- Lista de aulas matriculadas
- Para cada aula:
  - Checkbox de dias da semana
  - Input de horário
- Preview de alterações

#### Step 8.4: Integrar no Perfil do Aluno
- Adicionar botão "Editar Horários"
- Exibir modal de confirmação
- Feedback de sucesso com detalhes

---

### **FASE 9: Jobs e Automações (2 dias)**

#### Step 9.1: Configurar Cron Jobs
- Criar Route Handlers em `/app/api/cron/...` protegidos por `CRON_SECRET` (invocáveis por GitHub Actions ou por node-cron no container).
- Criar `/jobs/` com lógica reutilizável chamada pelas rotas de cron.
- **Produção (VPS)**: Disparar jobs via GitHub Actions scheduled workflows (chamada HTTP às rotas) OU rodar node-cron dentro do container da aplicação.

#### Step 9.2: Job de Geração de Pagamentos
- Criar `/jobs/gerar-pagamentos.ts` (lógica) e `/app/api/cron/gerar-pagamentos/route.ts` (handler)
- Lógica: buscar matrículas ativas, criar pagamento do mês seguinte (timezone America/Sao_Paulo)
- Vercel Cron: dia 1º às 00:00 (America/Sao_Paulo)

#### Step 9.3: Job de Geração de Agendamentos
- Criar `/jobs/gerar-agendamentos.ts` (lógica) e route handler para cron
- Lógica: para cada matrícula, verificar dias e criar agendamentos (7 dias), respeitando unicidade (aula_id, aluno_id, data, horario)
- Vercel Cron: todo dia às 00:00 (America/Sao_Paulo)

#### Step 9.4: Job de Atualização de Status
- Criar `/jobs/atualizar-status.ts`
- Lógica 1: Agendamentos AGENDADOS -> AUSENTE (23:59)
- Lógica 2: Pagamentos PENDENTES + vencidos -> ATRASADO (06:00)

#### Step 9.5: Criar Route Handlers para Cron
- `/app/api/cron/gerar-pagamentos/route.ts`
- `/app/api/cron/gerar-agendamentos/route.ts`
- `/app/api/cron/atualizar-status/route.ts`
- Proteger com header/secret (ex.: `CRON_SECRET`) validado em cada rota

#### Step 9.6: Configurar disparo dos jobs em produção (VPS)
- **Opção A**: GitHub Actions — workflow(s) com `schedule` (cron expression) que fazem POST às rotas `/api/cron/...` com header `Authorization: Bearer ${{ secrets.CRON_SECRET }}`.
- **Opção B**: node-cron dentro do container — ao subir a aplicação, iniciar agendador que chama a lógica em `/jobs/` nos horários definidos (timezone America/Sao_Paulo).

---

### **FASE 10: Dashboard e Indicadores (1-2 dias)**

#### Step 10.1: Criar Queries para Dashboard
- Criar `/db/queries/dashboard.ts`
- Funções:
  - `getTotalAlunosAtivos()`
  - `getPagamentosPendentesMes()`
  - `getAgendamentosHoje()`
  - `getTaxaPresencaMes()`

#### Step 10.2: Buscar dados do Dashboard
- Server Action ou dados diretos no Server Component da página `/dashboard`
- Retornar todos os indicadores (total alunos, pagamentos pendentes, agendamentos hoje, taxa de presença)

#### Step 10.3: Criar Página de Dashboard
- `/app/(dashboard)/page.tsx`
- Cards com indicadores principais
- Mini gráfico de presença (opcional)
- Lista rápida de ações pendentes

#### Step 10.4: Criar Componentes de Indicadores
- `StatsCard` - Card reutilizável
- `PresencaChart` - Gráfico simples (chart.js ou recharts)

---

### **FASE 11: Melhorias de UX (1-2 dias)**

#### Step 11.1: Loading States
- Adicionar skeleton loaders em todas as páginas
- Spinner em botões de submit
- Feedback visual de ações

#### Step 11.2: Toasts e Notificações
- Instalar: `npm install sonner`
- Adicionar toast de sucesso/erro em todas as ações
- Feedback claro de operações

#### Step 11.3: Validações e Mensagens de Erro
- Revisar todas as validações de formulário
- Mensagens de erro amigáveis
- Tratamento de erros de API

#### Step 11.4: Responsividade
- Testar em mobile/tablet
- Ajustar tabelas para mobile (cards)
- Menu lateral responsivo

#### Step 11.5: Acessibilidade
- Adicionar labels corretos
- Navegação por teclado
- Contraste de cores adequado

---

### **FASE 12: Testes e Deploy (2 dias)**

#### Step 12.1: Testes Manuais
- Criar checklist de funcionalidades
- Testar todos os fluxos principais
- Verificar edge cases

#### Step 12.2: Preparar para Deploy
- Configurar variáveis de ambiente de produção (VPS ou Portainer)
- Build do Next.js otimizado (já contemplado no Dockerfile multi-stage)
- Postgres em produção já existe no servidor; garantir `DATABASE_URL` e migrations aplicadas

#### Step 12.3: Deploy na VPS (GitHub Actions + Docker Swarm / Portainer)
- **Pipeline**: GitHub Actions builda imagem Docker para **linux/arm64** (servidor ARM), faz push para registry (GHCR ou Docker Hub).
- **VPS**: Portainer + Traefik + Docker Swarm. Deploy via `docker stack deploy` (ou stack no Portainer) usando `docker-compose.prod.yml` (ou equivalente em formato stack).
- **Traefik**: Labels no compose prod para roteamento e HTTPS (host, certificado).
- **Secrets**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `CRON_SECRET` etc. em secrets do Swarm ou variáveis no Portainer.

#### Step 12.4: Configurar Cron Jobs em Produção
- Configurar GitHub Actions scheduled workflows que chamam `/api/cron/...` com `CRON_SECRET`, OU ativar node-cron no container.
- Testar jobs manualmente (curl ou botão no painel).

#### Step 12.5: Documentação
- Criar README.md
- Documentar variáveis de ambiente
- Guia de uso básico para o cliente

#### Step 12.6: Arquivos de infraestrutura (já criados)
- **Docker**: `Dockerfile` (multi-stage, ARM64); `.dockerignore`.
- **Desenvolvimento**: `docker-compose.dev.yml` — app + Postgres em container; `DATABASE_URL` no host aponta para `localhost:5432`.
- **Produção**: `docker-compose.prod.yml` — apenas app; Postgres externo no servidor; labels Traefik para Swarm; variáveis `REGISTRY`, `IMAGE_NAME`, `IMAGE_TAG`, `TRAEFIK_HOST` expandidas no deploy (envsubst).
- **CI/CD**: `.github/workflows/deploy.yml` — build ARM64, push para GHCR, cópia do compose para a VPS, `docker stack deploy`. Variáveis do repositório: `VPS_HOST`, `VPS_USER`, `DEPLOY_PATH`, `TRAEFIK_HOST`. Secrets: `SSH_PRIVATE_KEY`; login no GHCR usa `GITHUB_TOKEN` (automático).
- **Env**: `.env.example` — lista de variáveis para dev e prod (DATABASE_URL, NEXTAUTH_*, CRON_SECRET, TZ).

---

## 10. Estimativa de Tempo Total

| Fase | Tempo Estimado |
|------|----------------|
| 1. Setup do Projeto | 1-2 dias |
| 2. Schema e Autenticação | 2 dias |
| 3. CRUD de Planos | 1-2 dias |
| 4. CRUD de Aulas | 1-2 dias |
| 5. CRUD de Alunos e Matrículas | 3-4 dias |
| 6. Gestão de Pagamentos | 2-3 dias |
| 7. Gestão de Agendamentos | 3-4 dias |
| 8. Alteração de Horários | 2 dias |
| 9. Jobs e Automações | 2 dias |
| 10. Dashboard | 1-2 dias |
| 11. Melhorias de UX | 1-2 dias |
| 12. Testes e Deploy | 2 dias |
| **TOTAL** | **21-30 dias** |

### Considerações:
- Estimativa para **1 desenvolvedor full-stack**
- Assumindo 6-8 horas produtivas por dia
- Não inclui reuniões ou revisões com cliente
- Buffer de 20% para imprevistos já incluído

---

## 11. Próximos Passos Pós-MVP

### 10.1 Funcionalidades Futuras
1. **WhatsApp Integration**
   - Envio automático de lembretes de pagamento
   - Confirmação de presença por WhatsApp
   - Notificações de novas aulas

2. **Relatórios**
   - Relatório de inadimplência
   - Relatório de presença por aluno/período
   - Relatório financeiro mensal

3. **App Mobile para Alunos**
   - Visualizar horários
   - Confirmar presença
   - Ver histórico de pagamentos

4. **Multi-unidades**
   - Suporte para várias academias
   - Gestão centralizada

5. **Gestão de Professores**
   - Vincular professores a aulas
   - Controle de presença de professores

### 10.2 Otimizações Técnicas
- Implementar cache (Redis)
- Otimizar queries complexas
- Adicionar testes automatizados (Jest, Playwright)
- Separar API (se necessário app mobile nativo)

---

## 12. Checklist de Entrega

### Funcionalidades
- [ ] Login e autenticação
- [ ] CRUD de Planos
- [ ] CRUD de Aulas
- [ ] CRUD de Alunos
- [ ] Cadastro completo de aluno com matrícula
- [ ] Gestão de pagamentos
- [ ] Confirmação de recebimento
- [ ] Geração automática de pagamentos mensais
- [ ] Gestão de agendamentos
- [ ] Controle de presença
- [ ] Adicionar/remover aluno de aula
- [ ] Alteração de horários de aluno
- [ ] Dashboard com indicadores
- [ ] Jobs automatizados funcionando

### Técnico
- [ ] Deploy em produção
- [ ] Banco de dados configurado
- [ ] Cron jobs configurados
- [ ] SSL/HTTPS ativo
- [ ] Backups automáticos do banco

### Documentação
- [ ] README.md
- [ ] Guia de uso
- [ ] Credenciais de acesso entregues

---

## 13. Contatos e Suporte

- **Desenvolvedor**: [Seu nome]
- **Email**: [Seu email]
- **Repositório**: [URL do GitHub]
- **URL Produção**: [URL da aplicação]

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2026  
**Status**: Planejamento