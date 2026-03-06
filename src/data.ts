// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Setor {
  id: number;
  nome: string;
}

export interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  setorId: number;
  horasDisponiveisMes: number;
  custoHoraInterno: number;
  ativo: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  segmento: string;
  mensalidade: number;
  ativo: boolean;
}

export interface CategoriaTarefa {
  id: number;
  nome: string;
}

export type StatusTarefa = 'Concluida' | 'EmAndamento' | 'Pausada' | 'Pendente';
export type Prioridade = 'Alta' | 'Media' | 'Baixa';
export type ClassificacaoRentabilidade = 'Lucrativo' | 'Atencao' | 'Prejuizo';

export interface Tarefa {
  id: number;
  clienteId: number;
  colaboradorId: number;
  categoriaTarefaId: number;
  titulo: string;
  status: StatusTarefa;
  prioridade: Prioridade;
  data: string;
}

export interface ApontamentoTempo {
  id: number;
  tarefaId: number;
  inicio: string;
  fim: string | null;
  minutosTrabalhados: number;
  minutosPausados: number;
  pausas: number;
}

export interface IndicadorCliente {
  clienteId: number;
  horasConsumidas: number;
  valorPago: number;
  custoEstimado: number;
  lucroEstimado: number;
  margemPercentual: number;
  classificacao: ClassificacaoRentabilidade;
}

export interface IndicadorColaborador {
  colaboradorId: number;
  horasProdutivas: number;
  horasPausadas: number;
  tarefasConcluidas: number;
  tempoMedioPorTarefaHoras: number;
  produtividadePercentualSobreDisponibilidade: number;
}

export interface KpisGerais {
  horasProdutivasTotais: number;
  horasPausadasTotais: number;
  tarefasConcluidas: number;
  tarefasEmAndamento: number;
  clientesAtivos: number;
  colaboradoresAtivos: number;
  faturamentoMensalTotal: number;
  custoOperacionalMensal: number;
  capacidadeHorasMensal: number;
  custoHoraEscritorio: number;
}

export interface Configuracoes {
  moeda: string;
  jornada_horas_mes_por_colaborador: number;
  custo_operacional_mensal_escritorio: number;
  total_colaboradores: number;
  total_horas_disponiveis_mes: number;
  custo_hora_escritorio: number;
}

export interface DadosBI {
  configuracoes: Configuracoes;
  setores: Setor[];
  colaboradores: Colaborador[];
  clientes: Cliente[];
  categoriasTarefa: CategoriaTarefa[];
  tarefas: Tarefa[];
  apontamentosTempo: ApontamentoTempo[];
  indicadoresCliente: IndicadorCliente[];
  indicadoresColaborador: IndicadorColaborador[];
  kpisGerais: KpisGerais;
}

// =====================================================
// DATA
// =====================================================

export const dados: DadosBI = {
  configuracoes: {
    moeda: "BRL",
    jornada_horas_mes_por_colaborador: 160,
    custo_operacional_mensal_escritorio: 48000.0,
    total_colaboradores: 4,
    total_horas_disponiveis_mes: 640,
    custo_hora_escritorio: 75.0
  },
  setores: [
    { id: 1, nome: "Contabil" },
    { id: 2, nome: "Fiscal" },
    { id: 3, nome: "Departamento Pessoal" },
    { id: 4, nome: "Administrativo" }
  ],
  colaboradores: [
    { id: 1, nome: "Ana Paula", cargo: "Analista Contabil", setorId: 1, horasDisponiveisMes: 160, custoHoraInterno: 68.0, ativo: true },
    { id: 2, nome: "Bruno Lima", cargo: "Analista Fiscal", setorId: 2, horasDisponiveisMes: 160, custoHoraInterno: 72.0, ativo: true },
    { id: 3, nome: "Carla Mendes", cargo: "Assistente DP", setorId: 3, horasDisponiveisMes: 160, custoHoraInterno: 55.0, ativo: true },
    { id: 4, nome: "Diego Rocha", cargo: "Coordenador Operacional", setorId: 4, horasDisponiveisMes: 160, custoHoraInterno: 95.0, ativo: true }
  ],
  clientes: [
    { id: 1, nome: "Alfa Comercio Ltda", segmento: "Comercio", mensalidade: 3500.0, ativo: true },
    { id: 2, nome: "Beta Servicos ME", segmento: "Servicos", mensalidade: 2200.0, ativo: true },
    { id: 3, nome: "Gamma Industria SA", segmento: "Industria", mensalidade: 6800.0, ativo: true },
    { id: 4, nome: "Delta Transportes Ltda", segmento: "Logistica", mensalidade: 4200.0, ativo: true },
    { id: 5, nome: "Epsilon Clinica Medica", segmento: "Saude", mensalidade: 1800.0, ativo: true }
  ],
  categoriasTarefa: [
    { id: 1, nome: "Lancamento Contabil" },
    { id: 2, nome: "Apuracao Fiscal" },
    { id: 3, nome: "Folha de Pagamento" },
    { id: 4, nome: "Reuniao / Atendimento" },
    { id: 5, nome: "Obrigacoes Acessorias" },
    { id: 6, nome: "Consultoria" }
  ],
  tarefas: [
    { id: 1, clienteId: 1, colaboradorId: 1, categoriaTarefaId: 1, titulo: "Conciliacao e lancamento contabil mensal", status: "Concluida", prioridade: "Alta", data: "2026-03-01" },
    { id: 2, clienteId: 1, colaboradorId: 2, categoriaTarefaId: 2, titulo: "Apuracao de impostos do periodo", status: "Concluida", prioridade: "Alta", data: "2026-03-02" },
    { id: 3, clienteId: 2, colaboradorId: 3, categoriaTarefaId: 3, titulo: "Processamento da folha de pagamento", status: "Concluida", prioridade: "Media", data: "2026-03-02" },
    { id: 4, clienteId: 3, colaboradorId: 2, categoriaTarefaId: 5, titulo: "Entrega de obrigacao acessoria", status: "Concluida", prioridade: "Alta", data: "2026-03-03" },
    { id: 5, clienteId: 3, colaboradorId: 4, categoriaTarefaId: 6, titulo: "Consultoria sobre reorganizacao tributaria", status: "Concluida", prioridade: "Alta", data: "2026-03-03" },
    { id: 6, clienteId: 4, colaboradorId: 1, categoriaTarefaId: 4, titulo: "Reuniao de alinhamento mensal", status: "Concluida", prioridade: "Media", data: "2026-03-04" },
    { id: 7, clienteId: 5, colaboradorId: 1, categoriaTarefaId: 1, titulo: "Classificacao contabil de documentos", status: "Concluida", prioridade: "Media", data: "2026-03-04" },
    { id: 8, clienteId: 5, colaboradorId: 4, categoriaTarefaId: 4, titulo: "Atendimento sobre reajuste contratual", status: "EmAndamento", prioridade: "Alta", data: "2026-03-05" }
  ],
  apontamentosTempo: [
    { id: 1, tarefaId: 1, inicio: "2026-03-01T08:00:00", fim: "2026-03-01T10:30:00", minutosTrabalhados: 150, minutosPausados: 15, pausas: 1 },
    { id: 2, tarefaId: 2, inicio: "2026-03-02T09:00:00", fim: "2026-03-02T12:00:00", minutosTrabalhados: 165, minutosPausados: 15, pausas: 1 },
    { id: 3, tarefaId: 3, inicio: "2026-03-02T08:30:00", fim: "2026-03-02T11:30:00", minutosTrabalhados: 160, minutosPausados: 20, pausas: 2 },
    { id: 4, tarefaId: 4, inicio: "2026-03-03T13:00:00", fim: "2026-03-03T17:00:00", minutosTrabalhados: 210, minutosPausados: 30, pausas: 2 },
    { id: 5, tarefaId: 5, inicio: "2026-03-03T14:00:00", fim: "2026-03-03T17:30:00", minutosTrabalhados: 180, minutosPausados: 30, pausas: 1 },
    { id: 6, tarefaId: 6, inicio: "2026-03-04T10:00:00", fim: "2026-03-04T11:30:00", minutosTrabalhados: 75, minutosPausados: 15, pausas: 1 },
    { id: 7, tarefaId: 7, inicio: "2026-03-04T13:30:00", fim: "2026-03-04T16:00:00", minutosTrabalhados: 135, minutosPausados: 15, pausas: 1 },
    { id: 8, tarefaId: 8, inicio: "2026-03-05T15:00:00", fim: null, minutosTrabalhados: 60, minutosPausados: 10, pausas: 1 }
  ],
  indicadoresCliente: [
    { clienteId: 1, horasConsumidas: 5.25, valorPago: 3500.0, custoEstimado: 393.75, lucroEstimado: 3106.25, margemPercentual: 88.75, classificacao: "Lucrativo" },
    { clienteId: 2, horasConsumidas: 2.67, valorPago: 2200.0, custoEstimado: 200.25, lucroEstimado: 1999.75, margemPercentual: 90.9, classificacao: "Lucrativo" },
    { clienteId: 3, horasConsumidas: 6.5, valorPago: 6800.0, custoEstimado: 487.5, lucroEstimado: 6312.5, margemPercentual: 92.83, classificacao: "Lucrativo" },
    { clienteId: 4, horasConsumidas: 1.25, valorPago: 4200.0, custoEstimado: 93.75, lucroEstimado: 4106.25, margemPercentual: 97.77, classificacao: "Lucrativo" },
    { clienteId: 5, horasConsumidas: 3.25, valorPago: 1800.0, custoEstimado: 243.75, lucroEstimado: 1556.25, margemPercentual: 86.46, classificacao: "Lucrativo" }
  ],
  indicadoresColaborador: [
    { colaboradorId: 1, horasProdutivas: 6.0, horasPausadas: 0.75, tarefasConcluidas: 3, tempoMedioPorTarefaHoras: 2.0, produtividadePercentualSobreDisponibilidade: 3.75 },
    { colaboradorId: 2, horasProdutivas: 6.25, horasPausadas: 0.75, tarefasConcluidas: 2, tempoMedioPorTarefaHoras: 3.13, produtividadePercentualSobreDisponibilidade: 3.91 },
    { colaboradorId: 3, horasProdutivas: 2.67, horasPausadas: 0.33, tarefasConcluidas: 1, tempoMedioPorTarefaHoras: 2.67, produtividadePercentualSobreDisponibilidade: 1.67 },
    { colaboradorId: 4, horasProdutivas: 4.0, horasPausadas: 0.67, tarefasConcluidas: 1, tempoMedioPorTarefaHoras: 4.0, produtividadePercentualSobreDisponibilidade: 2.5 }
  ],
  kpisGerais: {
    horasProdutivasTotais: 18.92,
    horasPausadasTotais: 2.5,
    tarefasConcluidas: 7,
    tarefasEmAndamento: 1,
    clientesAtivos: 5,
    colaboradoresAtivos: 4,
    faturamentoMensalTotal: 18500.0,
    custoOperacionalMensal: 48000.0,
    capacidadeHorasMensal: 640,
    custoHoraEscritorio: 75.0
  }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getClienteNome(id: number): string {
  return dados.clientes.find(c => c.id === id)?.nome ?? 'Desconhecido';
}

export function getColaboradorNome(id: number): string {
  return dados.colaboradores.find(c => c.id === id)?.nome ?? 'Desconhecido';
}

export function getSetorNome(id: number): string {
  return dados.setores.find(s => s.id === id)?.nome ?? 'Desconhecido';
}

export function getCategoriaNome(id: number): string {
  return dados.categoriasTarefa.find(c => c.id === id)?.nome ?? 'Desconhecido';
}

export function getColaboradorSetor(colaboradorId: number): string {
  const colab = dados.colaboradores.find(c => c.id === colaboradorId);
  if (!colab) return 'Desconhecido';
  return getSetorNome(colab.setorId);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

export function formatHours(value: number): string {
  return value.toFixed(2) + 'h';
}
