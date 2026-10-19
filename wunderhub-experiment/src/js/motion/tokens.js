// Espelho em segundos dos tokens de movimento de src/styles/tokens.css (seção 2.8).
// Mude os dois arquivos juntos.
import { spring } from 'motion';

export const easeCorte = [0.2, 0, 0, 1]; // apresentação 480–720ms
export const easeResposta = [0.3, 0, 0, 1]; // feedback 120–200ms
export const easeSaida = [0.3, 0, 0.8, 0.15]; // saída 200–240ms

export const dur = {
  toque: 0.12,
  resposta: 0.16,
  saida: 0.2,
  saidaLonga: 0.24,
  placa: 0.24,
  painel: 0.48,
  revelacao: 0.52,
  porta: 0.72,
};

export const stagger = {
  vao: 0.09,
  captura: 0.06,
};

// Soltar o polegar do trilho do processo (M3): mola sem quique.
export const encaixe = { type: spring, visualDuration: 0.3, bounce: 0 };

// Ângulo único do sistema (seção 2.6).
export const CORTE_GRAUS = 16;
export const CORTE_TAN = Math.tan((CORTE_GRAUS * Math.PI) / 180); // 0,2867
export const VETOR_CORTE = [0.961, 0.276]; // ao longo do corte
export const PERPENDICULAR = [-0.276, 0.961]; // perpendicular ao corte (para baixo e para a esquerda)

// Distâncias (seção 2.8), em px ou fração da altura da tela.
export const distancia = {
  pressionado: 2,
  fendaLinhas: 4,
  fendaLetreiro: 6,
  meiaFendaAberta: 8,
  menu: 24,
  maxForaDoPalco: 48,
};

// Quantização do peso do letreiro no palco.
export const passoPeso = { fino: 20, grosso: 40 };
