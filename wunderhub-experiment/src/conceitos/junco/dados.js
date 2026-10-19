// Dados da Junco Fisioterapia (seção 7.2). Frente: junco.
// Os textos dos tratamentos ficam no HTML (funcionam sem JS); aqui só o que o JS precisa.

/** slug usado em ?tratamento= → nome exibido no pedido de avaliação */
export const tratamentos = {
  ortopedica: 'Fisioterapia ortopédica',
  'pos-cirurgia': 'Reabilitação depois de cirurgia',
  'pilates-clinico': 'Pilates clínico',
  esportiva: 'Fisioterapia esportiva',
  'gestacao-pos-parto': 'Fisioterapia na gestação e no pós-parto',
};

/** valores de ?para= aceitos pelos filtros da página Tratamentos */
export const filtros = ['todos', 'dor', 'cirurgia', 'esporte', 'gestacao'];

/** Horários fictícios (seção 7.2): segunda a sexta e sábado. Domingo fechado. */
export const horarios = {
  semana: [7, 8, 9, 10, 14, 15, 16, 17, 18, 19],
  sabado: [8, 9, 10, 11],
};

export const diasDaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const diasPorExtenso = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
