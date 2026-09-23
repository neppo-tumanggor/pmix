'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Megaphone, Package, RefreshCw, ShoppingCart, UserPlus, Users } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardData, RecentActivity } from '@/lib/types/dashboard';
import classes from './dashboard.module.css';

const numberFormatter = new Intl.NumberFormat('id-ID');
const currencyFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const metrics = [
  { label: 'Total customers', value: 'totalCustomers', growth: 'customerGrowth', icon: Users, format: numberFormatter.format },
  { label: 'Product catalog', value: 'totalProducts', growth: 'productGrowth', icon: Package, format: numberFormatter.format },
  { label: 'Active campaigns', value: 'totalCampaigns', growth: 'campaignGrowth', icon: Megaphone, format: numberFormatter.format },
  { label: 'Total revenue', value: 'totalRevenue', growth: 'revenueGrowth', icon: Banknote, format: currencyFormatter.format },
] as const;

function activityIcon(type: RecentActivity['type']) {
  const icons = { customer: UserPlus, product: Package, campaign: Megaphone, order: ShoppingCart };
  const Icon = icons[type] ?? AlertCircle;
  return <Icon size={17} strokeWidth={1.8} />;
}

function relativeTime(timestamp: string) {
  const elapsed = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 60_000) return 'Baru saja';
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} hari lalu` : new Date(timestamp).toLocaleDateString('id-ID');
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await dashboardApi.getDashboardData());
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Dashboard tidak dapat dimuat';
      setError(message);
      notifications.show({ title: 'Gagal memuat dashboard', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadDashboard]);
  const maxRevenue = useMemo(() => Math.max(...(data?.charts.revenue.map((entry) => entry.value) ?? [1]), 1), [data]);

  return (
    <main className={classes.page}>
      <Stack gap={32}>
        <PageHeader
          breadcrumb={<Text className={classes.eyebrow}>Business overview</Text>}
          title="Dashboard"
          description="Ringkasan performa bisnis dan aktivitas terbaru Anda."
          action={<Button variant="default" leftSection={<RefreshCw size={16} />} onClick={() => void loadDashboard()} loading={loading}>Perbarui data</Button>}
        />

        {error && (
          <Alert icon={<AlertCircle size={18} />} title="Data belum dapat ditampilkan" color="red" variant="light">
            <Group justify="space-between" wrap="wrap">
              <Text size="sm">{error}</Text>
              <Button size="xs" variant="subtle" color="red" onClick={() => void loadDashboard()}>Coba lagi</Button>
            </Group>
          </Alert>
        )}

        <section className={classes.metrics} aria-label="Metrik utama">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = data?.stats[metric.value] ?? 0;
            const growth = data?.stats[metric.growth] ?? 0;
            const trendClass = growth > 0 ? classes.positive : growth < 0 ? classes.negative : classes.neutral;
            const TrendIcon = growth < 0 ? ArrowDownRight : ArrowUpRight;
            return (
              <Card key={metric.value} className={classes.metricCard} interactive>
                <div className={classes.metricTop}>
                  <div className={classes.metricIcon}><Icon size={20} strokeWidth={1.8} /></div>
                  <span className={`${classes.trend} ${trendClass}`}><TrendIcon size={14} /> {Math.abs(growth)}%</span>
                </div>
                <div className={classes.metricLabel}>{metric.label}</div>
                {loading ? <Skeleton mt={8} height={34} width="72%" /> : <div className={classes.metricValue}>{metric.format(value)}</div>}
              </Card>
            );
          })}
        </section>

        <section className={classes.contentGrid} aria-label="Analitik dan aktivitas">
          <Card className={classes.panel}>
            <div className={classes.panelHeader}>
              <div><h2 className={classes.panelTitle}>Pendapatan</h2><div className={classes.panelDescription}>Performa pendapatan berdasarkan periode terakhir</div></div>
              <Badge variant="light" color="blue">IDR</Badge>
            </div>
            {loading ? <Skeleton height={276} /> : data?.charts.revenue.length ? (
              <div className={classes.chart} role="img" aria-label="Grafik pendapatan">
                {data.charts.revenue.map((entry) => (
                  <div className={classes.barGroup} key={entry.date} title={`${entry.date}: ${currencyFormatter.format(entry.value)}`}>
                    <div className={classes.bar} style={{ height: `${Math.max((entry.value / maxRevenue) * 88, 3)}%` }} />
                    <span className={classes.barLabel}>{entry.date}</span>
                  </div>
                ))}
              </div>
            ) : <div className={classes.empty}>Belum ada data pendapatan.</div>}
          </Card>

          <Card className={classes.panel}>
            <div className={classes.panelHeader}>
              <div><h2 className={classes.panelTitle}>Aktivitas terbaru</h2><div className={classes.panelDescription}>Perubahan terkini di workspace</div></div>
              <Badge variant="outline" color="gray">{data?.recentActivity.length ?? 0}</Badge>
            </div>
            {loading ? <Stack gap="md">{[1, 2, 3, 4].map((item) => <Skeleton key={item} height={64} />)}</Stack> : data?.recentActivity.length ? (
              <div className={classes.activityList}>
                {data.recentActivity.slice(0, 6).map((activity) => (
                  <div className={classes.activity} key={activity.id}>
                    <div className={classes.activityIcon}>{activityIcon(activity.type)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className={classes.activityTitle}>{activity.title}</div>
                      <div className={classes.activityDescription}>{activity.description}</div>
                      <time className={classes.activityTime} dateTime={activity.timestamp}>{relativeTime(activity.timestamp)}</time>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className={classes.empty}>Belum ada aktivitas terbaru.</div>}
          </Card>
        </section>
      </Stack>
    </main>
  );
}
