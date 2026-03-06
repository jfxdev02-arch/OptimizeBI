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

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: COLORS.slate400,
        font: baseFont,
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: COLORS.slate800,
      titleColor: COLORS.slate100,
      bodyColor: COLORS.slate300,
      borderColor: COLORS.slate700,
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
        color: 'rgba(148,163,184,0.08)',
        drawBorder: false,
      },
      ticks: {
        color: COLORS.slate400,
        font: baseFont,
        padding: 8,
      },
      border: { display: false },
    },
    y: {
      grid: {
        color: 'rgba(148,163,184,0.08)',
        drawBorder: false,
      },
      ticks: {
        color: COLORS.slate400,
        font: baseFont,
        padding: 8,
      },
      border: { display: false },
    },
  },
};

export function createBarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  datasets: { label: string; data: number[]; backgroundColor: string | string[]; borderRadius?: number }[],
  horizontal: boolean = false,
  options: Record<string, unknown> = {},
): Chart {
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: datasets.map(d => ({ ...d, borderRadius: d.borderRadius ?? 6, borderSkipped: false, barThickness: horizontal ? 24 : undefined, maxBarThickness: 48 })) },
    options: {
      ...defaultChartOptions,
      indexAxis: horizontal ? 'y' as const : 'x' as const,
      ...options,
      plugins: {
        ...defaultChartOptions.plugins,
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
        pointBorderColor: COLORS.slate900,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: !!d.backgroundColor,
      })),
    },
    options: {
      ...defaultChartOptions,
      ...options,
      plugins: {
        ...defaultChartOptions.plugins,
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
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: COLORS.slate900,
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          ...defaultChartOptions.plugins.legend,
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
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(d => ({ ...d, borderRadius: 4, borderSkipped: false })),
    },
    options: {
      ...defaultChartOptions,
      ...options,
      scales: {
        ...defaultChartOptions.scales,
        x: { ...defaultChartOptions.scales.x, stacked: true },
        y: { ...defaultChartOptions.scales.y, stacked: true },
      },
      plugins: {
        ...defaultChartOptions.plugins,
        legend: { ...defaultChartOptions.plugins.legend, display: true },
        ...(options.plugins as Record<string, unknown> || {}),
      },
    } as never,
  });
}

export { Chart };
