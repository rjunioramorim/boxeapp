/**
 * Schema Drizzle - Boxeapp MVP
 * Conforme PRD seção 3: users, planos, aulas, planos_aulas, alunos, matriculas,
 * matriculas_aulas, pagamentos, agendamentos.
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  time,
  date,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────────────────────

export const tipoPlanoEnum = pgEnum("tipo_plano", ["INDIVIDUAL", "COLETIVO"]);

export const statusAlunoEnum = pgEnum("status_aluno", [
  "ATIVO",
  "INATIVO",
  "SUSPENSO",
]);

export const statusMatriculaEnum = pgEnum("status_matricula", [
  "ATIVA",
  "CANCELADA",
  "SUSPENSA",
]);

export const statusPagamentoEnum = pgEnum("status_pagamento", [
  "PENDENTE",
  "PAGO",
  "ATRASADO",
  "CANCELADO",
]);

export const statusAgendamentoEnum = pgEnum("status_agendamento", [
  "AGENDADO",
  "PRESENTE",
  "AUSENTE",
  "CANCELADO",
]);

export const tipoAgendamentoEnum = pgEnum("tipo_agendamento", [
  "AUTOMATICO",
  "MANUAL",
]);

// ─── Tabelas ────────────────────────────────────────────────────────────────

/** Usuários (autenticação admin) */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Planos (Individual / Coletivo) */
export const planos = pgTable("planos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  tipo: tipoPlanoEnum("tipo").notNull(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  qtdDias: integer("qtd_dias").default(3).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Aulas (ex: Boxe, Muay Thai) - dias_semana: 1=seg ... 7=dom */
export const aulas = pgTable("aulas", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  diasSemana: integer("dias_semana").array().notNull(),
  horario: time("horario", { precision: 0 }).notNull(),
  duracaoMinutos: integer("duracao_minutos").notNull(),
  capacidadeMaxima: integer("capacidade_maxima").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Relação N:N planos ↔ aulas */
export const planosAulas = pgTable(
  "planos_aulas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planoId: uuid("plano_id")
      .notNull()
      .references(() => planos.id, { onDelete: "cascade" }),
    aulaId: uuid("aula_id")
      .notNull()
      .references(() => aulas.id, { onDelete: "cascade" }),
  },
);

/** Alunos */
export const alunos = pgTable("alunos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  email: text("email"),
  status: statusAlunoEnum("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Matrículas (aluno + plano + dia vencimento) */
export const matriculas = pgTable("matriculas", {
  id: uuid("id").defaultRandom().primaryKey(),
  alunoId: uuid("aluno_id")
    .notNull()
    .references(() => alunos.id, { onDelete: "cascade" }),
  planoId: uuid("plano_id")
    .notNull()
    .references(() => planos.id, { onDelete: "restrict" }),
  diaVencimento: integer("dia_vencimento").notNull(), // 1 a 31
  dataInicio: date("data_inicio", { mode: "date" }).notNull(),
  dataFim: date("data_fim", { mode: "date" }),
  status: statusMatriculaEnum("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Horários específicos do aluno por aula (matrícula ↔ aula; horário/dias customizados) */
export const matriculasAulas = pgTable("matriculas_aulas", {
  id: uuid("id").defaultRandom().primaryKey(),
  matriculaId: uuid("matricula_id")
    .notNull()
    .references(() => matriculas.id, { onDelete: "cascade" }),
  aulaId: uuid("aula_id")
    .notNull()
    .references(() => aulas.id, { onDelete: "cascade" }),
  horario: time("horario", { precision: 0 }),
  diasSemana: integer("dias_semana").array(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Pagamentos (mensalidades) */
export const pagamentos = pgTable("pagamentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  matriculaId: uuid("matricula_id")
    .notNull()
    .references(() => matriculas.id, { onDelete: "cascade" }),
  valorEsperado: numeric("valor_esperado", { precision: 10, scale: 2 }).notNull(),
  valorPago: numeric("valor_pago", { precision: 10, scale: 2 }),
  mesReferencia: date("mes_referencia", { mode: "date" }).notNull(),
  dataVencimento: date("data_vencimento", { mode: "date" }).notNull(),
  dataPagamento: date("data_pagamento", { mode: "date" }),
  status: statusPagamentoEnum("status").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Agendamentos (aula + aluno + data + horário); constraint única (aula_id, aluno_id, data, horario) */
export const agendamentos = pgTable(
  "agendamentos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    aulaId: uuid("aula_id")
      .notNull()
      .references(() => aulas.id, { onDelete: "cascade" }),
    alunoId: uuid("aluno_id")
      .notNull()
      .references(() => alunos.id, { onDelete: "cascade" }),
    matriculaId: uuid("matricula_id")
      .notNull()
      .references(() => matriculas.id, { onDelete: "cascade" }),
    data: date("data", { mode: "date" }).notNull(),
    horario: time("horario", { precision: 0 }).notNull(),
    status: statusAgendamentoEnum("status").notNull(),
    tipo: tipoAgendamentoEnum("tipo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("agendamentos_aula_aluno_data_horario_unique").on(
      t.aulaId,
      t.alunoId,
      t.data,
      t.horario,
    ),
  ],
);

// ─── Relations (Drizzle ORM - para queries com with) ───────────────────────

import { relations } from "drizzle-orm";

export const usersRelations = relations(users, () => ({}));

export const planosRelations = relations(planos, ({ many }) => ({
  planosAulas: many(planosAulas),
  matriculas: many(matriculas),
}));

export const aulasRelations = relations(aulas, ({ many }) => ({
  planosAulas: many(planosAulas),
  matriculasAulas: many(matriculasAulas),
  agendamentos: many(agendamentos),
}));

export const planosAulasRelations = relations(planosAulas, ({ one }) => ({
  plano: one(planos),
  aula: one(aulas),
}));

export const alunosRelations = relations(alunos, ({ many }) => ({
  matriculas: many(matriculas),
  agendamentos: many(agendamentos),
}));

export const matriculasRelations = relations(matriculas, ({ one, many }) => ({
  aluno: one(alunos),
  plano: one(planos),
  matriculasAulas: many(matriculasAulas),
  pagamentos: many(pagamentos),
  agendamentos: many(agendamentos),
}));

export const matriculasAulasRelations = relations(matriculasAulas, ({ one }) => ({
  matricula: one(matriculas),
  aula: one(aulas),
}));

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  matricula: one(matriculas),
}));

export const agendamentosRelations = relations(agendamentos, ({ one }) => ({
  aula: one(aulas),
  aluno: one(alunos),
  matricula: one(matriculas),
}));
