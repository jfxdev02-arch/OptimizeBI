import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

// Color palette
export const COLORS = {
  primary:     '#6366f1',
  primaryLight:'#818cf8',
  primaryDark: '#4f46e5',
  accent:      '#06b6d4',
  accentLight: '#22d3ee',
  success:     '#10b981',
  successLight:'#34d399',
  warning:     '#f59e0b',
  warningLight:'#fbbf24',
  danger:      '#ef4444',
  dangerLight: '#f87171',
  purple:      '#a855f7',
  pink:        '#ec4899',
  orange:      '#f97316',
  teal:        '#14b8a6',
  slate50:     '#f8fafc',
  slate100:    '#f1f5f9',
  slate200:    '#e2e8f0',
  slate300:    '#cbd5e1',
  slate400:    '#94a3b8',
  slate500:    '#64748b',
  slate600:    '#475569',
  slate700:    '#334155',
  slate800:    '#1e293b',
  slate900:    '#0f172a',
  slate950:    '#020617',
};

export const CHART_COLORS = [
  COLORS.primary,
  COLORS.accent,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.orange,
  COLORS.teal,
  COLORS.dangerLight,
  COLORS.primaryLight,
];

const baseFont = {
  family: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  size: 12,
  weight: '400' as const,
};

export function isDark(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function themeColors() {
  const dark = isDark();
  return {
    text: dark ? COLORS.slate400 : COLORS.slate500,
    grid: dark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)',
    tooltipBg: dark ? COLORS.slate800 : '#ffffff',
    tooltipTitle: dark ? COLORS.slate100 : COLORS.slate900,
    tooltipBody: dark ? COLORS.slate300 : COLORS.slate600,
    tooltipBorder: dark ? COLORS.slate700 : COLORS.slate200,
    legendText: dark ? COLORS.slate400 : COLORS.slate500,
    pointBorder: dark ? COLORS.slate900 : '#ffffff',
    doughnutBorder: dark ? COLORS.slate900 : '#ffffff',
  };
}

function getDefaultChartOptions() {
  const tc = themeColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: tc.legendText,
          font: baseFont,
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: tc.tooltipBg,
        titleColor: tc.tooltipTitle,
        bodyColor: tc.tooltipBody,
        borderColor: tc.tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { ...baseFont, weight: '600' as const },
        bodyFont: baseFont,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          color: tc.grid,
          drawBorder: false,
        },
        ticks: {
          color: tc.text,
          font: baseFont,
          padding: 8,
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: tc.grid,
          drawBorder: false,
        },
        ticks: {
          color: tc.text,
          font: baseFont,
          padding: 8,
        },
        border: { display: false },
      },
    },
  };
}

export function createBarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  datasets: { label: string; data: number[]; backgroundColor: string | string[]; borderRadius?: number }[],
  horizontal: boolean = false,
  options: Record<string, unknown> = {},
): Chart {
  const defaults = getDefaultChartOptions();
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: datasets.map(d => ({ ...d, borderRadius: d.borderRadius ?? 6, borderSkipped: false, barThickness: horizontal ? 24 : undefined, maxBarThickness: 48 })) },
    options: {
      ...defaults,
      indexAxis: horizontal ? 'y' as const : 'x' as const,
      ...options,
      plugins: {
        ...defaults.plugins,
        ...(options.plugins as Record<string, unknown> || {}),
      },
    } as never,
  });
}

export function createLineChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  datasets: { label: string; data: number[]; borderColor: string; backgroundColor?: string }[],
  options: Record<string, unknown> = {},
): Chart {
  const defaults = getDefaultChartOptions();
  const tc = themeColors();
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(d => ({
        ...d,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: d.borderColor,
        pointBorderColor: tc.pointBorder,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: !!d.backgroundColor,
      })),
    },
    options: {
      ...defaults,
      ...options,
      plugins: {
        ...defaults.plugins,
        ...(options.plugins as Record<string, unknown> || {}),
      },
    } as never,
  });
}

export function createDoughnutChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
  colors: string[] = CHART_COLORS,
  options: Record<string, unknown> = {},
): Chart {
  const defaults = getDefaultChartOptions();
  const tc = themeColors();
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: tc.doughnutBorder,
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        ...defaults.plugins,
        legend: {
          ...defaults.plugins.legend,
          display: true,
          position: 'bottom' as const,
        },
        ...(options.plugins as Record<string, unknown> || {}),
      },
      ...options,
    } as never,
  });
}

export function createStackedBarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  datasets: { label: string; data: number[]; backgroundColor: string }[],
  options: Record<string, unknown> = {},
): Chart {
  const defaults = getDefaultChartOptions();
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(d => ({ ...d, borderRadius: 4, borderSkipped: false })),
    },
    options: {
      ...defaults,
      ...options,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, stacked: true },
        y: { ...defaults.scales.y, stacked: true },
      },
      plugins: {
        ...defaults.plugins,
        legend: { ...defaults.plugins.legend, display: true },
        ...(options.plugins as Record<string, unknown> || {}),
      },
    } as never,
  });
}

export { Chart };
