-- Script para limpar agendamentos duplicados e manter apenas os corretos
-- Execute este script no Drizzle Studio ou diretamente no PostgreSQL

-- 1. Ver agendamentos duplicados (mesma matrícula, data e aula)
SELECT 
    matricula_id,
    aula_id,
    data,
    horario,
    COUNT(*) as total
FROM agendamentos
WHERE status = 'AGENDADO'
GROUP BY matricula_id, aula_id, data, horario
HAVING COUNT(*) > 1;

-- 2. Deletar todos os agendamentos futuros de uma matrícula específica
-- Substitua 'MATRICULA_ID_AQUI' pelo ID da matrícula que deseja limpar
DELETE FROM agendamentos
WHERE matricula_id = 'MATRICULA_ID_AQUI'
AND data >= CURRENT_DATE;

-- 3. Após executar o DELETE acima, vá no sistema e clique em "Alterar Horários"
-- e salve novamente para recriar os agendamentos corretos
