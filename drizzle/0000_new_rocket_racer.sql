CREATE TYPE "public"."status_agendamento" AS ENUM('AGENDADO', 'PRESENTE', 'AUSENTE', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."status_aluno" AS ENUM('ATIVO', 'INATIVO', 'SUSPENSO');--> statement-breakpoint
CREATE TYPE "public"."status_matricula" AS ENUM('ATIVA', 'CANCELADA', 'SUSPENSA');--> statement-breakpoint
CREATE TYPE "public"."status_pagamento" AS ENUM('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."tipo_agendamento" AS ENUM('AUTOMATICO', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."tipo_plano" AS ENUM('INDIVIDUAL', 'COLETIVO');--> statement-breakpoint
CREATE TABLE "agendamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aula_id" uuid NOT NULL,
	"aluno_id" uuid NOT NULL,
	"matricula_id" uuid NOT NULL,
	"data" date NOT NULL,
	"horario" time(0) NOT NULL,
	"status" "status_agendamento" NOT NULL,
	"tipo" "tipo_agendamento" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agendamentos_aula_aluno_data_horario_unique" UNIQUE("aula_id","aluno_id","data","horario")
);
--> statement-breakpoint
CREATE TABLE "alunos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"telefone" text NOT NULL,
	"email" text,
	"status" "status_aluno" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"dias_semana" integer[] NOT NULL,
	"horario" time(0) NOT NULL,
	"duracao_minutos" integer NOT NULL,
	"capacidade_maxima" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matriculas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"plano_id" uuid NOT NULL,
	"dia_vencimento" integer NOT NULL,
	"data_inicio" date NOT NULL,
	"data_fim" date,
	"status" "status_matricula" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matriculas_aulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matricula_id" uuid NOT NULL,
	"aula_id" uuid NOT NULL,
	"horario" time(0),
	"dias_semana" integer[],
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matricula_id" uuid NOT NULL,
	"valor_esperado" numeric(10, 2) NOT NULL,
	"valor_pago" numeric(10, 2),
	"mes_referencia" date NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"status" "status_pagamento" NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_plano" NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"qtd_dias" integer DEFAULT 3 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planos_aulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plano_id" uuid NOT NULL,
	"aula_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_aula_id_aulas_id_fk" FOREIGN KEY ("aula_id") REFERENCES "public"."aulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_matricula_id_matriculas_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matriculas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas_aulas" ADD CONSTRAINT "matriculas_aulas_matricula_id_matriculas_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matriculas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas_aulas" ADD CONSTRAINT "matriculas_aulas_aula_id_aulas_id_fk" FOREIGN KEY ("aula_id") REFERENCES "public"."aulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_matricula_id_matriculas_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matriculas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos_aulas" ADD CONSTRAINT "planos_aulas_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos_aulas" ADD CONSTRAINT "planos_aulas_aula_id_aulas_id_fk" FOREIGN KEY ("aula_id") REFERENCES "public"."aulas"("id") ON DELETE cascade ON UPDATE no action;