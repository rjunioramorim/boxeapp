# Padrão de CRUD (base: Planos)

Este documento descreve como os CRUDs são realizados no projeto, tendo **Planos** como referência. Use como base para Aulas, Alunos, Pagamentos, Agendamentos e demais entidades.

**Premissas:** Next.js 16 (App Router), Server Actions para mutations, Drizzle ORM, Zod para validação, react-hook-form nos formulários, layout mobile-first (touch-friendly).

---

## 1. Estrutura de pastas (por entidade)

Para uma entidade `<Entidade>` (ex: Planos, Aulas):

```
src/
├── lib/
│   ├── db/queries/<entidade>.ts    # Acesso ao banco (Drizzle)
│   ├── schemas/<entidade>.ts       # Validação Zod + tipos
│   ├── services/<entidade>.ts      # Lógica de negócio (usa queries)
│   └── actions/<entidade>.ts       # Server Actions ("use server")
├── components/<entidade>/
│   ├── <entidade>-form.tsx         # Formulário reutilizável (criar/editar)
│   ├── <entidade>-list.tsx         # Listagem (cards mobile + tabela desktop)
│   └── <entidade>-list-wrapper.tsx  # Lista + dialog de confirmação (ex: delete)
└── app/(dashboard)/<entidade>/
    ├── page.tsx                    # Listagem (Server Component)
    ├── novo/page.tsx               # Criar
    └── [id]/editar/page.tsx        # Editar
```

- **Queries**: apenas Drizzle (select, insert, update, delete). Sem `requireAuth`; sem validação Zod.
- **Services**: chamam as queries; podem validar ID e lançar "não encontrado"; usam tipos do schema.
- **Actions**: `"use server"`, `requireAuth`, leem FormData/parâmetros, validam com Zod, chamam services, `revalidatePath`, retornam `{ success, data? }` ou `{ success: false, error }`.
- **Componentes**: client quando usam estado ou formulário (react-hook-form); listagem pode receber dados do server.
- **Páginas**: preferir Server Components; dados iniciais via actions ou chamada direta ao service.

---

## 2. Camadas e responsabilidades

| Camada     | Onde              | Responsabilidade |
|------------|-------------------|-------------------|
| **Queries** | `lib/db/queries/` | CRUD puro no banco; tipos inferidos do schema Drizzle. |
| **Schemas** | `lib/schemas/`    | Zod: schema de criação, `.partial()` para atualização; exportar `FormValues` e `UpdateValues`. |
| **Services** | `lib/services/`   | Encapsular queries; validar ID e “não encontrado”; transformações simples. |
| **Actions** | `lib/actions/`     | Autenticação (`requireAuth`), parse (FormData → objeto), validação Zod, chamar service, revalidar, retorno padronizado. |
| **UI**      | `components/` + `app/` | Formulários (react-hook-form + zod), listagem mobile-first, páginas que disparam actions. |

---

## 3. Queries (`lib/db/queries/<entidade>.ts`)

- **Funções típicas:** `getAll`, `getById`, `create`, `update`, `delete`.
- **Extras conforme necessidade:** `getByXId` (ex: aulas por plano), tipos compostos (ex: `PlanoWithAulas`).
- **Contrato:** funções puras de banco; parâmetros tipados; retorno `T | null` para get único, `T[]` para listas, `T` para create/update quando usar `.returning()`.
- **Exemplo (Planos):** `getAllPlanos`, `getPlanoById`, `getPlanoWithAulas`, `createPlano`, `updatePlano`, `deletePlano`.

```ts
// Exemplo de assinaturas (planos)
export async function getAllPlanos();
export async function getPlanoById(id: string);
export async function getPlanoWithAulas(id: string);
export async function createPlano(data: { nome, tipo, valor, qtdDias?, ativo? });
export async function updatePlano(id: string, data: Partial<...>);
export async function deletePlano(id: string);
```

---

## 4. Schemas Zod (`lib/schemas/<entidade>.ts`)

- **Schema de criação:** todos os campos obrigatórios/opcionais conforme regra de negócio; enums e números com `.min()`/`.max()` quando fizer sentido.
- **Schema de atualização:** `schema.partial()` para PATCH.
- **Exportar tipos:** `PlanoFormValues = z.infer<typeof planoSchema>`, `PlanoUpdateValues = z.infer<typeof planoUpdateSchema>`.

```ts
export const planoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["INDIVIDUAL", "COLETIVO"], { ... }),
  valor: z.string().min(1).refine(...),
  qtdDias: z.number().int().min(1).max(31).optional(),
  ativo: z.boolean().optional(),
});
export const planoUpdateSchema = planoSchema.partial();
export type PlanoFormValues = z.infer<typeof planoSchema>;
export type PlanoUpdateValues = z.infer<typeof planoUpdateSchema>;
```

- **Índice:** em `lib/schemas/index.ts` exportar o módulo da entidade (`export * from "./planos"`).

---

## 5. Services (`lib/services/<entidade>.ts`)

- **Funções:** espelham as actions (listar, buscar, criar, atualizar, deletar); internamente chamam apenas as **queries**.
- **Busca por ID:** para páginas que exigem “404 se não existir”, usar `buscarXService(id)` e lançar `new Error("X não encontrado")` se a query retornar `null`. Oferecer também `buscarXServiceOrNull(id)` quando a página tratar null (ex: formulário opcional).
- **Create/Update/Delete:** recebem dados já tipados (ex: `PlanoFormValues` / `PlanoUpdateValues`); repassam para a query; delete pode lançar se não encontrar.

```ts
// Exemplo (planos)
export async function listarPlanosService(): Promise<Plano[]>;
export async function buscarPlanoService(id: string): Promise<Plano>;  // throw se não achar
export async function buscarPlanoServiceOrNull(id: string): Promise<Plano | null>;
export async function criarPlanoService(data: PlanoFormValues): Promise<Plano>;
export async function atualizarPlanoService(id: string, data: PlanoUpdateValues): Promise<Plano>;
export async function deletarPlanoService(id: string): Promise<void>;
```

---

## 6. Server Actions (`lib/actions/<entidade>.ts`)

- **Diretiva:** `"use server"` no topo do arquivo.
- **Autenticação:** em toda action que altera ou expõe dados sensíveis, chamar `await requireAuth()` no início.
- **Listar / Buscar:** podem apenas chamar o service e retornar os dados (para uso em Server Components).
- **Criar:** receber `FormData` (ou objeto); montar `rawData` a partir de `formData.get(...)`; `schema.parse(rawData)`; chamar `criarXService(validated)`; `revalidatePath("/<entidade>")`; retornar `{ success: true, data }` ou em erro `{ success: false, error: string }`. Tratar `z.ZodError` e outros `Error`.
- **Atualizar:** receber `id` e `FormData`; montar objeto parcial apenas com campos enviados; `updateSchema.parse(rawData)`; `atualizarXService(id, validated)`; `revalidatePath("/<entidade>")` e `revalidatePath("/<entidade>/[id]/editar")`; mesmo contrato de retorno.
- **Deletar:** receber `id`; `deletarXService(id)`; `revalidatePath("/<entidade>")`; retornar `{ success: true }` ou `{ success: false, error }`.

```ts
// Contrato de retorno
type ActionResult = 
  | { success: true; data?: T }
  | { success: false; error: string };
```

- **Checkbox/boolean:** tratar `formData.get("ativo") === "true" || formData.get("ativo") === "on"` para não confundir com string vazia.

---

## 7. Componentes

### 7.1 Formulário (`<entidade>-form.tsx`)

- **Client:** `"use client"`.
- **React Hook Form + Zod:** `useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })`.
- **Props:** `entidade?: Entidade | null` (para edição), `onSubmit: (data) => Promise<{ success: boolean; error?: string }>`, `onCancel?: () => void`.
- **defaultValues:** preencher a partir de `entidade` quando existir; caso contrário valores iniciais padrão.
- **Submit:** chamar `onSubmit(data)`; se `!result.success && result.error`, usar `form.setError("root", { message: result.error })`.
- **Mobile-first:** inputs e botões com `className="min-h-[44px] touch-manipulation"` (e botões de ação com área mínima 44px).

### 7.2 Listagem (`<entidade>-list.tsx`)

- **Props:** `itens: Entidade[]`, `onDelete?: (id: string) => void` (opcional).
- **Mobile:** blocos em cards (`md:hidden`); um card por item com informações principais e botões Editar / Excluir (touch-friendly).
- **Desktop:** tabela (`hidden md:table` ou `hidden md:block`) com colunas e ações na última coluna.
- **Formatação:** moeda, datas e enums com funções locais (ex: `formatCurrency`, `formatTipo`) para reuso.

### 7.3 Wrapper da lista (`<entidade>-list-wrapper.tsx`)

- **Client:** estado para o item selecionado para exclusão e para loading do delete.
- **Renderiza:** `<EntidadeList>` com `onDelete={(id) => setParaDeletar(id)}`.
- **Dialog de confirmação:** ao confirmar, chama a action de deletar; em sucesso, `router.refresh()` e limpa o estado; em erro, exibe mensagem (ex: `alert` ou toast).

---

## 8. Páginas

### 8.1 Listagem (`app/(dashboard)/<entidade>/page.tsx`)

- **Server Component.** Chamar a action de listar (ex: `listarPlanos()`) e passar o resultado para o wrapper da lista.
- **Layout:** título, descrição e botão “Novo” (link para `/<entidade>/novo`); Card envolvendo o wrapper.

### 8.2 Novo (`app/(dashboard)/<entidade>/novo/page.tsx`)

- **handleSubmit no server:** função assíncrona que monta `FormData` (ou objeto) a partir dos dados do form, chama a action de criar e, em `result.success`, faz `redirect("/<entidade>")`; caso contrário retorna `result` para o form exibir erro.
- **Formulário:** `<EntidadeForm onSubmit={handleSubmit} />` (sem entidade, defaultValues de criação).

### 8.3 Editar (`app/(dashboard)/<entidade>/[id]/editar/page.tsx`)

- **params:** `await params` (Next.js 16); obter `id`.
- **Dados:** chamar action de buscar por ID (ex: `buscarPlano(id)`); se não existir, `notFound()`.
- **handleSubmit no server:** recebe dados do form; monta FormData/objeto; chama action de atualizar; em sucesso, `redirect("/<entidade>")`; senão retorna resultado para o form.
- **Formulário:** `<EntidadeForm entidade={entidade} onSubmit={handleSubmit} />`.

---

## 9. Vínculos N:N (ex: Planos ↔ Aulas)

- **Queries:** além do CRUD da entidade principal, ter em `queries/<entidade>.ts` ou em uma tabela de junção:
  - `getXByYId(yId)` (ex: aulas por plano),
  - `getXIdsByYId(yId)` (ex: IDs das aulas do plano),
  - `setXsDoY(yId, xIds)` (substitui vínculos: delete todos do y e insert dos xIds).
- **Actions:** uma action específica para “atualizar vínculos” (ex: `atualizarAulasDoPlano(planoId, aulaIds)`) que chama a query de `set` e depois `revalidatePath` das rotas afetadas.
- **Formulário de edição da entidade “pai”:** seção extra (ex: “Aulas vinculadas”) com multi-select ou lista de checkboxes; ao salvar a seção (ou o form inteiro), chamar a action de vínculo com a lista de IDs selecionados.

---

## 10. Checklist por nova entidade CRUD

- [ ] `lib/db/queries/<entidade>.ts`: getAll, getById, create, update, delete (+ getByX se N:N).
- [ ] `lib/schemas/<entidade>.ts`: schema Zod, partial, FormValues, UpdateValues; export em `schemas/index.ts`.
- [ ] `lib/services/<entidade>.ts`: listar, buscar (throw/null), criar, atualizar, deletar.
- [ ] `lib/actions/<entidade>.ts`: "use server", requireAuth, listar, buscar, criar, atualizar, deletar (retorno padronizado + revalidatePath).
- [ ] `components/<entidade>/`: form, list, list-wrapper (mobile cards + desktop table, min-h 44px).
- [ ] `app/(dashboard)/<entidade>/`: page.tsx, novo/page.tsx, [id]/editar/page.tsx.
- [ ] Navegação: link no layout/nav do dashboard para `/<entidade>`.

Referência de código: **Planos** (`src/lib/db/queries/planos.ts`, `src/lib/services/planos.ts`, `src/lib/actions/planos.ts`, `src/lib/schemas/planos.ts`, `src/components/planos/`, `src/app/(dashboard)/planos/`).
