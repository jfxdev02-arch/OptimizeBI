import { dados, formatCurrency, formatPercent, formatHours, getClienteNome, getColaboradorNome, getCategoriaNome, getColaboradorSetor } from './data';
import { icon } from './icons';
import { createBarChart, createDoughnutChart, createStackedBarChart, createLineChart, COLORS, CHART_COLORS, Chart } from './charts';
import './style.css';

// =====================================================
// STATE
// =====================================================
type Section = 'visao-geral' | 'produtividade' | 'demanda' | 'rentabilidade' | 'tarefas';

let currentSection: Section = 'visao-geral';
let sidebarOpen = false;
const chartInstances: Chart[] = [];

function destroyCharts() {
  chartInstances.forEach(c => c.destroy());
  chartInstances.length = 0;
}

// =====================================================
// RENDER - LAYOUT
// =====================================================
function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderSidebar()}
    <div class="main-area">
      ${renderTopBar()}
      <main class="content" id="content-area">
        ${renderSection()}
      </main>
    </div>
    <div class="sidebar-overlay ${sidebarOpen ? 'active' : ''}" id="sidebar-overlay"></div>
  `;
  bindEvents();
  setTimeout(() => initCharts(), 50);
}

// =====================================================
// SIDEBAR
// =====================================================
function renderSidebar(): string {
  const navItems: { id: Section; label: string; iconName: string }[] = [
    { id: 'visao-geral', label: 'Visao Geral', iconName: 'dashboard' },
    { id: 'produtividade', label: 'Produtividade', iconName: 'activity' },
    { id: 'demanda', label: 'Demanda', iconName: 'building' },
    { id: 'rentabilidade', label: 'Rentabilidade', iconName: 'dollarSign' },
    { id: 'tarefas', label: 'Tarefas', iconName: 'layers' },
  ];
  return `
    <aside class="sidebar ${sidebarOpen ? 'open' : ''}" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 36 36" fill="none" width="36" height="36">
            <rect width="36" height="36" rx="10" fill="url(#brandGrad)"/>
            <defs><linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
            <path d="M10 26V14l8-6 8 6v12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <rect x="14" y="18" width="8" height="8" rx="1" stroke="#fff" stroke-width="1.5" fill="none"/>
            <line x1="18" y1="18" x2="18" y2="26" stroke="#fff" stroke-width="1.5"/>
            <line x1="14" y1="22" x2="22" y2="22" stroke="#fff" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">Contabil BI</span>
          <span class="brand-sub">Business Intelligence</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Menu Principal</div>
        ${navItems.map(item => `
          <button class="nav-item ${currentSection === item.id ? 'active' : ''}" data-section="${item.id}">
            ${icon(item.iconName as never, 20)}
            <span>${item.label}</span>
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-footer-info">
          ${icon('shield', 16)}
          <span>Uso interno</span>
        </div>
        <div class="sidebar-footer-version">v1.0.0</div>
      </div>
    </aside>
  `;
}

// =====================================================
// TOP BAR
// =====================================================
function renderTopBar(): string {
  const sectionTitles: Record<Section, string> = {
    'visao-geral': 'Visao Geral Executiva',
    'produtividade': 'Produtividade por Colaborador',
    'demanda': 'Demanda por Empresa',
    'rentabilidade': 'Rentabilidade por Cliente',
    'tarefas': 'Analise por Tipo de Tarefa',
  };
  const sectionIcons: Record<Section, string> = {
    'visao-geral': 'dashboard',
    'produtividade': 'activity',
    'demanda': 'building',
    'rentabilidade': 'dollarSign',
    'tarefas': 'layers',
  };

  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="topbar-menu-btn" id="menu-toggle">${icon('menu', 22)}</button>
        <div class="topbar-title-area">
          <div class="topbar-icon">${icon(sectionIcons[currentSection] as never, 22)}</div>
          <div>
            <h1 class="topbar-title">${sectionTitles[currentSection]}</h1>
            <p class="topbar-subtitle">Marco 2026 &middot; ${dados.configuracoes.total_colaboradores} colaboradores &middot; ${dados.clientes.length} clientes</p>
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <div class="topbar-badge">
          ${icon('calendar', 14)}
          <span>Mar/2026</span>
        </div>
      </div>
    </header>
  `;
}

// =====================================================
// SECTION ROUTER
// =====================================================
function renderSection(): string {
  destroyCharts();
  switch (currentSection) {
    case 'visao-geral': return renderVisaoGeral();
    case 'produtividade': return renderProdutividade();
    case 'demanda': return renderDemanda();
    case 'rentabilidade': return renderRentabilidade();
    case 'tarefas': return renderTarefas();
  }
}

// =====================================================
// KPI CARD COMPONENT
// =====================================================
function kpiCard(config: {
  title: string;
  value: string;
  subtitle?: string;
  iconName: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
}): string {
  const trendHtml = config.trend
    ? `<span class="kpi-trend ${config.trendUp ? 'up' : 'down'}">${config.trendUp ? icon('arrowUp', 12) : icon('arrowDown', 12)} ${config.trend}</span>`
    : '';
  return `
    <div class="kpi-card">
      <div class="kpi-card-header">
        <span class="kpi-card-title">${config.title}</span>
        <div class="kpi-card-icon" style="background:${config.color}15;color:${config.color}">
          ${icon(config.iconName as never, 20)}
        </div>
      </div>
      <div class="kpi-card-value">${config.value}</div>
      <div class="kpi-card-footer">
        ${config.subtitle ? `<span class="kpi-card-subtitle">${config.subtitle}</span>` : ''}
        ${trendHtml}
      </div>
    </div>
  `;
}

// =====================================================
// CHART CARD COMPONENT
// =====================================================
function chartCard(title: string, canvasId: string, extraClass: string = '', rightContent: string = ''): string {
  return `
    <div class="chart-card ${extraClass}">
      <div class="chart-card-header">
        <h3 class="chart-card-title">${title}</h3>
        ${rightContent}
      </div>
      <div class="chart-card-body">
        <canvas id="${canvasId}"></canvas>
      </div>
    </div>
  `;
}

// =====================================================
// SECTION: VISAO GERAL
// =====================================================
function renderVisaoGeral(): string {
  const k = dados.kpisGerais;
  const lucroEstimado = k.faturamentoMensalTotal - (k.horasProdutivasTotais * k.custoHoraEscritorio);
  const margemMedia = dados.indicadoresCliente.reduce((a, c) => a + c.margemPercentual, 0) / dados.indicadoresCliente.length;
  const prodMedia = dados.indicadoresColaborador.reduce((a, c) => a + c.horasProdutivas, 0) / dados.indicadoresColaborador.length;

  return `
    <div class="kpi-grid">
      ${kpiCard({ title: 'Horas Produtivas', value: formatHours(k.horasProdutivasTotais), subtitle: `de ${k.capacidadeHorasMensal}h disponiveis`, iconName: 'clock', color: COLORS.primary })}
      ${kpiCard({ title: 'Horas Pausadas', value: formatHours(k.horasPausadasTotais), subtitle: formatPercent((k.horasPausadasTotais / (k.horasProdutivasTotais + k.horasPausadasTotais)) * 100) + ' do total', iconName: 'pause', color: COLORS.warning })}
      ${kpiCard({ title: 'Empresas Atendidas', value: String(k.clientesAtivos), subtitle: 'clientes ativos', iconName: 'building', color: COLORS.accent })}
      ${kpiCard({ title: 'Tarefas Concluidas', value: String(k.tarefasConcluidas), subtitle: k.tarefasEmAndamento + ' em andamento', iconName: 'checkCircle', color: COLORS.success })}
      ${kpiCard({ title: 'Produtividade Media', value: formatHours(prodMedia), subtitle: 'por colaborador', iconName: 'activity', color: COLORS.purple })}
      ${kpiCard({ title: 'Faturamento Mensal', value: formatCurrency(k.faturamentoMensalTotal), subtitle: dados.clientes.length + ' contratos', iconName: 'dollarSign', color: COLORS.success })}
      ${kpiCard({ title: 'Custo Operacional', value: formatCurrency(k.custoOperacionalMensal), subtitle: formatCurrency(k.custoHoraEscritorio) + '/hora', iconName: 'trendDown', color: COLORS.danger })}
      ${kpiCard({ title: 'Lucro Estimado', value: formatCurrency(lucroEstimado), subtitle: 'no periodo', iconName: 'trendUp', color: COLORS.success, trend: formatPercent((lucroEstimado / k.faturamentoMensalTotal) * 100), trendUp: true })}
      ${kpiCard({ title: 'Margem Media', value: formatPercent(margemMedia), subtitle: 'por cliente', iconName: 'percent', color: COLORS.primaryLight })}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Horas por Colaborador (Produtivas vs Pausas)', 'chart-colab-hours')}
      ${chartCard('Distribuicao por Categoria de Tarefa', 'chart-cat-dist')}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Horas Consumidas por Cliente', 'chart-client-hours')}
      ${chartCard('Rentabilidade por Cliente', 'chart-rent-overview')}
    </div>

    <div class="charts-grid cols-1">
      ${chartCard('Evolucao Diaria de Horas Trabalhadas', 'chart-daily-evolution')}
    </div>

    ${renderResumoTable()}
  `;
}

function renderResumoTable(): string {
  return `
    <div class="table-card">
      <div class="table-card-header">
        <h3 class="chart-card-title">Resumo de Tarefas</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Cliente</th>
              <th>Colaborador</th>
              <th>Categoria</th>
              <th>Horas</th>
              <th>Pausas</th>
              <th>Status</th>
              <th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            ${dados.tarefas.map(t => {
              const ap = dados.apontamentosTempo.find(a => a.tarefaId === t.id);
              const statusClass = t.status === 'Concluida' ? 'status-success' : 'status-warning';
              const prioridadeClass = t.prioridade === 'Alta' ? 'priority-high' : t.prioridade === 'Media' ? 'priority-medium' : 'priority-low';
              return `
                <tr>
                  <td class="cell-main">${t.titulo}</td>
                  <td>${getClienteNome(t.clienteId)}</td>
                  <td>${getColaboradorNome(t.colaboradorId)}</td>
                  <td>${getCategoriaNome(t.categoriaTarefaId)}</td>
                  <td class="cell-number">${ap ? formatHours(ap.minutosTrabalhados / 60) : '-'}</td>
                  <td class="cell-number">${ap ? ap.pausas : '-'}</td>
                  <td><span class="status-badge ${statusClass}">${t.status === 'Concluida' ? 'Concluida' : 'Em Andamento'}</span></td>
                  <td><span class="priority-badge ${prioridadeClass}">${t.prioridade}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =====================================================
// SECTION: PRODUTIVIDADE
// =====================================================
function renderProdutividade(): string {
  const colabs = dados.indicadoresColaborador.map(ic => {
    const c = dados.colaboradores.find(co => co.id === ic.colaboradorId)!;
    return { ...ic, nome: c.nome, cargo: c.cargo, setor: getColaboradorSetor(c.id), disponivel: c.horasDisponiveisMes };
  }).sort((a, b) => b.horasProdutivas - a.horasProdutivas);

  const topProducer = colabs[0];

  return `
    <div class="kpi-grid kpi-grid-4">
      ${kpiCard({ title: 'Mais Produtivo', value: topProducer.nome, subtitle: formatHours(topProducer.horasProdutivas) + ' produtivas', iconName: 'award', color: COLORS.success })}
      ${kpiCard({ title: 'Tarefas Concluidas (Total)', value: String(colabs.reduce((a, c) => a + c.tarefasConcluidas, 0)), subtitle: 'no periodo', iconName: 'checkCircle', color: COLORS.primary })}
      ${kpiCard({ title: 'Tempo Medio por Tarefa', value: formatHours(colabs.reduce((a, c) => a + c.tempoMedioPorTarefaHoras, 0) / colabs.length), subtitle: 'media geral', iconName: 'clock', color: COLORS.accent })}
      ${kpiCard({ title: 'Taxa de Pausas', value: formatPercent((dados.kpisGerais.horasPausadasTotais / (dados.kpisGerais.horasProdutivasTotais + dados.kpisGerais.horasPausadasTotais)) * 100), subtitle: formatHours(dados.kpisGerais.horasPausadasTotais) + ' total pausado', iconName: 'pause', color: COLORS.warning })}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Ranking por Horas Produtivas', 'chart-prod-ranking')}
      ${chartCard('Horas Produtivas vs Pausadas', 'chart-prod-vs-pause')}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Tarefas Concluidas por Colaborador', 'chart-tasks-completed')}
      ${chartCard('Eficiencia Operacional (% Disponibilidade Utilizada)', 'chart-efficiency')}
    </div>

    <div class="table-card">
      <div class="table-card-header">
        <h3 class="chart-card-title">Detalhamento por Colaborador</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>Horas Produtivas</th>
              <th>Horas Pausadas</th>
              <th>Tarefas Concluidas</th>
              <th>Tempo Medio/Tarefa</th>
              <th>Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            ${colabs.map((c, i) => `
              <tr>
                <td class="cell-main">
                  <span class="rank-badge">${i + 1}</span>
                  ${c.nome}
                </td>
                <td>${c.cargo}</td>
                <td>${c.setor}</td>
                <td class="cell-number">${formatHours(c.horasProdutivas)}</td>
                <td class="cell-number">${formatHours(c.horasPausadas)}</td>
                <td class="cell-number">${c.tarefasConcluidas}</td>
                <td class="cell-number">${formatHours(c.tempoMedioPorTarefaHoras)}</td>
                <td class="cell-number">
                  <span class="efficiency-badge ${c.produtividadePercentualSobreDisponibilidade > 3 ? 'eff-good' : c.produtividadePercentualSobreDisponibilidade > 2 ? 'eff-medium' : 'eff-low'}">
                    ${formatPercent(c.produtividadePercentualSobreDisponibilidade)}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =====================================================
// SECTION: DEMANDA POR EMPRESA
// =====================================================
function renderDemanda(): string {
  const clienteHoras = dados.indicadoresCliente.map(ic => {
    const cli = dados.clientes.find(c => c.id === ic.clienteId)!;
    const tarefas = dados.tarefas.filter(t => t.clienteId === ic.clienteId);
    const apontamentos = tarefas.map(t => dados.apontamentosTempo.find(a => a.tarefaId === t.id)).filter(Boolean);
    const totalPausas = apontamentos.reduce((a, ap) => a + (ap?.pausas ?? 0), 0);
    return {
      ...ic,
      nome: cli.nome,
      segmento: cli.segmento,
      totalTarefas: tarefas.length,
      totalPausas,
    };
  }).sort((a, b) => b.horasConsumidas - a.horasConsumidas);

  const topCliente = clienteHoras[0];

  return `
    <div class="kpi-grid kpi-grid-4">
      ${kpiCard({ title: 'Maior Demanda', value: topCliente.nome, subtitle: formatHours(topCliente.horasConsumidas), iconName: 'building', color: COLORS.danger })}
      ${kpiCard({ title: 'Total de Horas Alocadas', value: formatHours(clienteHoras.reduce((a, c) => a + c.horasConsumidas, 0)), subtitle: 'todos os clientes', iconName: 'clock', color: COLORS.primary })}
      ${kpiCard({ title: 'Media Horas/Cliente', value: formatHours(clienteHoras.reduce((a, c) => a + c.horasConsumidas, 0) / clienteHoras.length), subtitle: 'no periodo', iconName: 'barChart', color: COLORS.accent })}
      ${kpiCard({ title: 'Total de Tarefas', value: String(dados.tarefas.length), subtitle: 'registradas no periodo', iconName: 'layers', color: COLORS.purple })}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Horas Consumidas por Empresa', 'chart-demand-hours', '', '')}
      ${chartCard('Distribuicao de Tarefas por Empresa', 'chart-demand-tasks')}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Pausas por Empresa', 'chart-demand-pauses')}
      ${chartCard('Distribuicao por Segmento', 'chart-demand-segment')}
    </div>

    <div class="table-card">
      <div class="table-card-header">
        <h3 class="chart-card-title">Detalhamento por Empresa</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Segmento</th>
              <th>Horas Consumidas</th>
              <th>Tarefas</th>
              <th>Pausas</th>
              <th>Mensalidade</th>
              <th>Custo/Hora</th>
            </tr>
          </thead>
          <tbody>
            ${clienteHoras.map(c => `
              <tr>
                <td class="cell-main">${c.nome}</td>
                <td><span class="segment-badge">${c.segmento}</span></td>
                <td class="cell-number">${formatHours(c.horasConsumidas)}</td>
                <td class="cell-number">${c.totalTarefas}</td>
                <td class="cell-number">${c.totalPausas}</td>
                <td class="cell-number">${formatCurrency(c.valorPago)}</td>
                <td class="cell-number">${formatCurrency(c.valorPago / c.horasConsumidas)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =====================================================
// SECTION: RENTABILIDADE
// =====================================================
function renderRentabilidade(): string {
  const ind = dados.indicadoresCliente.map(ic => {
    const cli = dados.clientes.find(c => c.id === ic.clienteId)!;
    return { ...ic, nome: cli.nome, segmento: cli.segmento };
  }).sort((a, b) => b.margemPercentual - a.margemPercentual);

  const lucrativos = ind.filter(i => i.classificacao === 'Lucrativo').length;
  const atencao = ind.filter(i => i.classificacao === 'Atencao').length;
  const prejuizo = ind.filter(i => i.classificacao === 'Prejuizo').length;
  const lucroTotal = ind.reduce((a, c) => a + c.lucroEstimado, 0);

  return `
    <div class="kpi-grid kpi-grid-4">
      ${kpiCard({ title: 'Lucro Total Estimado', value: formatCurrency(lucroTotal), subtitle: 'no periodo', iconName: 'trendUp', color: COLORS.success })}
      ${kpiCard({ title: 'Clientes Lucrativos', value: String(lucrativos), subtitle: 'de ' + ind.length + ' clientes', iconName: 'checkCircle', color: COLORS.success })}
      ${kpiCard({ title: 'Clientes Atencao', value: String(atencao), subtitle: 'margem reduzida', iconName: 'alertTriangle', color: COLORS.warning })}
      ${kpiCard({ title: 'Clientes Prejuizo', value: String(prejuizo), subtitle: 'renegociar', iconName: 'trendDown', color: COLORS.danger })}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Margem por Cliente (%)', 'chart-margin-client')}
      ${chartCard('Receita vs Custo por Cliente', 'chart-revenue-cost')}
    </div>

    <div class="charts-grid cols-1">
      ${chartCard('Lucro Estimado por Cliente', 'chart-profit-client')}
    </div>

    <div class="table-card">
      <div class="table-card-header">
        <h3 class="chart-card-title">Analise de Rentabilidade Detalhada</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Segmento</th>
              <th>Mensalidade</th>
              <th>Horas Consumidas</th>
              <th>Custo Estimado</th>
              <th>Lucro Estimado</th>
              <th>Margem</th>
              <th>Classificacao</th>
            </tr>
          </thead>
          <tbody>
            ${ind.map(c => {
              const classClass = c.classificacao === 'Lucrativo' ? 'status-success' : c.classificacao === 'Atencao' ? 'status-warning' : 'status-danger';
              return `
                <tr>
                  <td class="cell-main">${c.nome}</td>
                  <td><span class="segment-badge">${c.segmento}</span></td>
                  <td class="cell-number">${formatCurrency(c.valorPago)}</td>
                  <td class="cell-number">${formatHours(c.horasConsumidas)}</td>
                  <td class="cell-number">${formatCurrency(c.custoEstimado)}</td>
                  <td class="cell-number cell-profit">${formatCurrency(c.lucroEstimado)}</td>
                  <td class="cell-number">
                    <div class="margin-indicator">
                      <div class="margin-bar-track">
                        <div class="margin-bar-fill" style="width:${Math.min(c.margemPercentual, 100)}%;background:${c.margemPercentual >= 70 ? COLORS.success : c.margemPercentual >= 40 ? COLORS.warning : COLORS.danger}"></div>
                      </div>
                      <span>${formatPercent(c.margemPercentual)}</span>
                    </div>
                  </td>
                  <td><span class="status-badge ${classClass}">${c.classificacao}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="info-card">
      <div class="info-card-header">
        ${icon('zap', 20)}
        <h3>Formula de Calculo</h3>
      </div>
      <div class="formula-grid">
        <div class="formula-item">
          <span class="formula-label">Custo/Hora do Escritorio</span>
          <span class="formula-value">Custo Operacional Mensal / Total Horas Disponiveis = ${formatCurrency(dados.configuracoes.custo_hora_escritorio)}</span>
        </div>
        <div class="formula-item">
          <span class="formula-label">Custo do Cliente</span>
          <span class="formula-value">Horas Consumidas x Custo/Hora</span>
        </div>
        <div class="formula-item">
          <span class="formula-label">Lucro do Cliente</span>
          <span class="formula-value">Mensalidade - Custo do Cliente</span>
        </div>
        <div class="formula-item">
          <span class="formula-label">Margem</span>
          <span class="formula-value">Lucro / Mensalidade x 100</span>
        </div>
      </div>
    </div>
  `;
}

// =====================================================
// SECTION: TAREFAS
// =====================================================
function renderTarefas(): string {
  // Aggregate by category
  const catStats = dados.categoriasTarefa.map(cat => {
    const tarefas = dados.tarefas.filter(t => t.categoriaTarefaId === cat.id);
    const apontamentos = tarefas.map(t => dados.apontamentosTempo.find(a => a.tarefaId === t.id)).filter(Boolean);
    const totalMinutos = apontamentos.reduce((a, ap) => a + (ap?.minutosTrabalhados ?? 0), 0);
    const totalPausas = apontamentos.reduce((a, ap) => a + (ap?.pausas ?? 0), 0);
    const totalMinutosPausa = apontamentos.reduce((a, ap) => a + (ap?.minutosPausados ?? 0), 0);
    return {
      id: cat.id,
      nome: cat.nome,
      totalTarefas: tarefas.length,
      horasConsumidas: totalMinutos / 60,
      totalPausas,
      horasPausadas: totalMinutosPausa / 60,
      tempoMedio: tarefas.length > 0 ? (totalMinutos / 60) / tarefas.length : 0,
    };
  }).filter(c => c.totalTarefas > 0).sort((a, b) => b.horasConsumidas - a.horasConsumidas);

  const topCategoria = catStats[0];

  return `
    <div class="kpi-grid kpi-grid-4">
      ${kpiCard({ title: 'Categoria Mais Demandada', value: topCategoria?.nome ?? '-', subtitle: topCategoria ? formatHours(topCategoria.horasConsumidas) : '', iconName: 'target', color: COLORS.primary })}
      ${kpiCard({ title: 'Categorias Ativas', value: String(catStats.length), subtitle: 'com tarefas no periodo', iconName: 'layers', color: COLORS.accent })}
      ${kpiCard({ title: 'Tempo Medio por Tarefa', value: formatHours(catStats.reduce((a, c) => a + c.tempoMedio, 0) / catStats.length), subtitle: 'media geral', iconName: 'clock', color: COLORS.purple })}
      ${kpiCard({ title: 'Total de Pausas', value: String(catStats.reduce((a, c) => a + c.totalPausas, 0)), subtitle: 'em todas as categorias', iconName: 'pause', color: COLORS.warning })}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Horas por Categoria de Tarefa', 'chart-task-cat-hours')}
      ${chartCard('Distribuicao de Tarefas por Categoria', 'chart-task-cat-dist')}
    </div>

    <div class="charts-grid cols-2">
      ${chartCard('Tempo Medio por Categoria', 'chart-task-avg-time')}
      ${chartCard('Pausas por Categoria', 'chart-task-pauses')}
    </div>

    <div class="table-card">
      <div class="table-card-header">
        <h3 class="chart-card-title">Detalhamento por Categoria</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Tarefas</th>
              <th>Horas Totais</th>
              <th>Horas Pausadas</th>
              <th>Pausas</th>
              <th>Tempo Medio</th>
              <th>% do Total</th>
            </tr>
          </thead>
          <tbody>
            ${catStats.map(c => {
              const totalHorasAll = catStats.reduce((a, cs) => a + cs.horasConsumidas, 0);
              const pct = (c.horasConsumidas / totalHorasAll) * 100;
              return `
                <tr>
                  <td class="cell-main">${c.nome}</td>
                  <td class="cell-number">${c.totalTarefas}</td>
                  <td class="cell-number">${formatHours(c.horasConsumidas)}</td>
                  <td class="cell-number">${formatHours(c.horasPausadas)}</td>
                  <td class="cell-number">${c.totalPausas}</td>
                  <td class="cell-number">${formatHours(c.tempoMedio)}</td>
                  <td class="cell-number">
                    <div class="margin-indicator">
                      <div class="margin-bar-track">
                        <div class="margin-bar-fill" style="width:${pct}%;background:${COLORS.primary}"></div>
                      </div>
                      <span>${formatPercent(pct)}</span>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =====================================================
// CHART INITIALIZATIONS
// =====================================================
function initCharts() {
  switch (currentSection) {
    case 'visao-geral': initChartsVisaoGeral(); break;
    case 'produtividade': initChartsProdutividade(); break;
    case 'demanda': initChartsDemanda(); break;
    case 'rentabilidade': initChartsRentabilidade(); break;
    case 'tarefas': initChartsTarefas(); break;
  }
}

function getCanvas(id: string): HTMLCanvasElement | null {
  return document.getElementById(id) as HTMLCanvasElement | null;
}

function initChartsVisaoGeral() {
  // Colab hours stacked
  const c1 = getCanvas('chart-colab-hours');
  if (c1) {
    const names = dados.indicadoresColaborador.map(ic => getColaboradorNome(ic.colaboradorId));
    chartInstances.push(createStackedBarChart(c1, names, [
      { label: 'Horas Produtivas', data: dados.indicadoresColaborador.map(ic => ic.horasProdutivas), backgroundColor: COLORS.primary },
      { label: 'Horas Pausadas', data: dados.indicadoresColaborador.map(ic => ic.horasPausadas), backgroundColor: COLORS.warningLight },
    ]));
  }

  // Category distribution doughnut
  const c2 = getCanvas('chart-cat-dist');
  if (c2) {
    const catStats = dados.categoriasTarefa.map(cat => {
      const tarefas = dados.tarefas.filter(t => t.categoriaTarefaId === cat.id);
      const mins = tarefas.reduce((a, t) => {
        const ap = dados.apontamentosTempo.find(a2 => a2.tarefaId === t.id);
        return a + (ap?.minutosTrabalhados ?? 0);
      }, 0);
      return { nome: cat.nome, horas: mins / 60 };
    }).filter(c => c.horas > 0);
    chartInstances.push(createDoughnutChart(c2, catStats.map(c => c.nome), catStats.map(c => c.horas)));
  }

  // Client hours bar
  const c3 = getCanvas('chart-client-hours');
  if (c3) {
    const sorted = [...dados.indicadoresCliente].sort((a, b) => b.horasConsumidas - a.horasConsumidas);
    chartInstances.push(createBarChart(c3,
      sorted.map(ic => getClienteNome(ic.clienteId)),
      [{ label: 'Horas Consumidas', data: sorted.map(ic => ic.horasConsumidas), backgroundColor: CHART_COLORS }],
      true
    ));
  }

  // Rentabilidade overview
  const c4 = getCanvas('chart-rent-overview');
  if (c4) {
    const sorted = [...dados.indicadoresCliente].sort((a, b) => b.margemPercentual - a.margemPercentual);
    chartInstances.push(createBarChart(c4,
      sorted.map(ic => getClienteNome(ic.clienteId)),
      [{
        label: 'Margem %',
        data: sorted.map(ic => ic.margemPercentual),
        backgroundColor: sorted.map(ic => ic.margemPercentual >= 70 ? COLORS.success : ic.margemPercentual >= 40 ? COLORS.warning : COLORS.danger),
      }],
      false
    ));
  }

  // Daily evolution
  const c5 = getCanvas('chart-daily-evolution');
  if (c5) {
    // Map apontamentos to daily output
    const daily: Record<string, number> = {};
    dados.apontamentosTempo.forEach(ap => {
      const date = ap.inicio.split('T')[0];
      daily[date] = (daily[date] || 0) + ap.minutosTrabalhados / 60;
    });
    const dates = Object.keys(daily).sort();
    chartInstances.push(createLineChart(c5,
      dates.map(d => { const parts = d.split('-'); return `${parts[2]}/${parts[1]}`; }),
      [{
        label: 'Horas Trabalhadas',
        data: dates.map(d => daily[d]),
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(99,102,241,0.1)',
      }],
    ));
  }
}

function initChartsProdutividade() {
  const colabs = dados.indicadoresColaborador.map(ic => ({
    ...ic,
    nome: getColaboradorNome(ic.colaboradorId),
  })).sort((a, b) => b.horasProdutivas - a.horasProdutivas);

  const c1 = getCanvas('chart-prod-ranking');
  if (c1) {
    chartInstances.push(createBarChart(c1,
      colabs.map(c => c.nome),
      [{ label: 'Horas Produtivas', data: colabs.map(c => c.horasProdutivas), backgroundColor: CHART_COLORS, borderRadius: 8 }],
      true
    ));
  }

  const c2 = getCanvas('chart-prod-vs-pause');
  if (c2) {
    chartInstances.push(createStackedBarChart(c2,
      colabs.map(c => c.nome),
      [
        { label: 'Produtivas', data: colabs.map(c => c.horasProdutivas), backgroundColor: COLORS.primary },
        { label: 'Pausadas', data: colabs.map(c => c.horasPausadas), backgroundColor: COLORS.warningLight },
      ]
    ));
  }

  const c3 = getCanvas('chart-tasks-completed');
  if (c3) {
    chartInstances.push(createBarChart(c3,
      colabs.map(c => c.nome),
      [{ label: 'Tarefas', data: colabs.map(c => c.tarefasConcluidas), backgroundColor: COLORS.accent }],
    ));
  }

  const c4 = getCanvas('chart-efficiency');
  if (c4) {
    chartInstances.push(createBarChart(c4,
      colabs.map(c => c.nome),
      [{
        label: 'Eficiencia %',
        data: colabs.map(c => c.produtividadePercentualSobreDisponibilidade),
        backgroundColor: colabs.map(c => c.produtividadePercentualSobreDisponibilidade > 3 ? COLORS.success : c.produtividadePercentualSobreDisponibilidade > 2 ? COLORS.warning : COLORS.danger),
      }],
    ));
  }
}

function initChartsDemanda() {
  const clienteData = dados.indicadoresCliente.map(ic => {
    const cli = dados.clientes.find(c => c.id === ic.clienteId)!;
    const tarefas = dados.tarefas.filter(t => t.clienteId === ic.clienteId);
    const apontamentos = tarefas.map(t => dados.apontamentosTempo.find(a => a.tarefaId === t.id)).filter(Boolean);
    return {
      ...ic,
      nome: cli.nome,
      segmento: cli.segmento,
      totalTarefas: tarefas.length,
      totalPausas: apontamentos.reduce((a, ap) => a + (ap?.pausas ?? 0), 0),
    };
  }).sort((a, b) => b.horasConsumidas - a.horasConsumidas);

  const c1 = getCanvas('chart-demand-hours');
  if (c1) {
    chartInstances.push(createBarChart(c1,
      clienteData.map(c => c.nome),
      [{ label: 'Horas', data: clienteData.map(c => c.horasConsumidas), backgroundColor: CHART_COLORS }],
      true
    ));
  }

  const c2 = getCanvas('chart-demand-tasks');
  if (c2) {
    chartInstances.push(createBarChart(c2,
      clienteData.map(c => c.nome),
      [{ label: 'Tarefas', data: clienteData.map(c => c.totalTarefas), backgroundColor: COLORS.accent }],
    ));
  }

  const c3 = getCanvas('chart-demand-pauses');
  if (c3) {
    chartInstances.push(createBarChart(c3,
      clienteData.map(c => c.nome),
      [{ label: 'Pausas', data: clienteData.map(c => c.totalPausas), backgroundColor: COLORS.warningLight }],
    ));
  }

  const c4 = getCanvas('chart-demand-segment');
  if (c4) {
    const segMap: Record<string, number> = {};
    clienteData.forEach(c => { segMap[c.segmento] = (segMap[c.segmento] || 0) + c.horasConsumidas; });
    chartInstances.push(createDoughnutChart(c4,
      Object.keys(segMap),
      Object.values(segMap),
    ));
  }
}

function initChartsRentabilidade() {
  const ind = dados.indicadoresCliente.map(ic => {
    const cli = dados.clientes.find(c => c.id === ic.clienteId)!;
    return { ...ic, nome: cli.nome };
  }).sort((a, b) => b.margemPercentual - a.margemPercentual);

  const c1 = getCanvas('chart-margin-client');
  if (c1) {
    chartInstances.push(createBarChart(c1,
      ind.map(c => c.nome),
      [{
        label: 'Margem %',
        data: ind.map(c => c.margemPercentual),
        backgroundColor: ind.map(c => c.margemPercentual >= 70 ? COLORS.success : c.margemPercentual >= 40 ? COLORS.warning : COLORS.danger),
      }],
      true
    ));
  }

  const c2 = getCanvas('chart-revenue-cost');
  if (c2) {
    chartInstances.push(createBarChart(c2,
      ind.map(c => c.nome),
      [
        { label: 'Receita', data: ind.map(c => c.valorPago), backgroundColor: COLORS.success },
        { label: 'Custo', data: ind.map(c => c.custoEstimado), backgroundColor: COLORS.danger },
      ],
      false,
      { plugins: { legend: { display: true } } }
    ));
  }

  const c3 = getCanvas('chart-profit-client');
  if (c3) {
    chartInstances.push(createBarChart(c3,
      ind.map(c => c.nome),
      [{
        label: 'Lucro Estimado',
        data: ind.map(c => c.lucroEstimado),
        backgroundColor: ind.map(c => c.lucroEstimado > 0 ? COLORS.success : COLORS.danger),
      }],
    ));
  }
}

function initChartsTarefas() {
  const catStats = dados.categoriasTarefa.map(cat => {
    const tarefas = dados.tarefas.filter(t => t.categoriaTarefaId === cat.id);
    const apontamentos = tarefas.map(t => dados.apontamentosTempo.find(a => a.tarefaId === t.id)).filter(Boolean);
    return {
      nome: cat.nome,
      totalTarefas: tarefas.length,
      horas: apontamentos.reduce((a, ap) => a + (ap?.minutosTrabalhados ?? 0), 0) / 60,
      pausas: apontamentos.reduce((a, ap) => a + (ap?.pausas ?? 0), 0),
      horasPausadas: apontamentos.reduce((a, ap) => a + (ap?.minutosPausados ?? 0), 0) / 60,
      tempoMedio: tarefas.length > 0 ? (apontamentos.reduce((a, ap) => a + (ap?.minutosTrabalhados ?? 0), 0) / 60) / tarefas.length : 0,
    };
  }).filter(c => c.totalTarefas > 0).sort((a, b) => b.horas - a.horas);

  const c1 = getCanvas('chart-task-cat-hours');
  if (c1) {
    chartInstances.push(createBarChart(c1,
      catStats.map(c => c.nome),
      [{ label: 'Horas', data: catStats.map(c => c.horas), backgroundColor: CHART_COLORS }],
      true
    ));
  }

  const c2 = getCanvas('chart-task-cat-dist');
  if (c2) {
    chartInstances.push(createDoughnutChart(c2,
      catStats.map(c => c.nome),
      catStats.map(c => c.totalTarefas),
    ));
  }

  const c3 = getCanvas('chart-task-avg-time');
  if (c3) {
    chartInstances.push(createBarChart(c3,
      catStats.map(c => c.nome),
      [{ label: 'Tempo Medio (h)', data: catStats.map(c => c.tempoMedio), backgroundColor: COLORS.purple }],
    ));
  }

  const c4 = getCanvas('chart-task-pauses');
  if (c4) {
    chartInstances.push(createBarChart(c4,
      catStats.map(c => c.nome),
      [{ label: 'Pausas', data: catStats.map(c => c.pausas), backgroundColor: COLORS.warningLight }],
    ));
  }
}

// =====================================================
// EVENTS
// =====================================================
function bindEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section') as Section;
      if (section && section !== currentSection) {
        currentSection = section;
        sidebarOpen = false;
        render();
      }
    });
  });

  // Menu toggle
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    sidebarOpen = !sidebarOpen;
    document.getElementById('sidebar')?.classList.toggle('open', sidebarOpen);
    document.getElementById('sidebar-overlay')?.classList.toggle('active', sidebarOpen);
  });

  // Overlay click
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
  });
}

// =====================================================
// INIT
// =====================================================
render();
