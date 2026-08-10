'use client';

import * as React from 'react';
import { getBrowserSupabase, isSupabaseConfigured } from '../supabase/client';
import type { RepairOrder } from '../../types';

export type TrackMode = 'orderNo' | 'phone';

interface TrackState {
  orders: RepairOrder[];
  loading: boolean;
  searched: boolean;
  error: string;
  /** 追蹤來源：realtime（Supabase 推播）或 polling（輪詢回退） */
  channel: 'realtime' | 'polling' | 'idle';
  lastSyncedAt: string | null;
}

const POLL_INTERVAL_MS = 20000;

function buildQuery(mode: TrackMode, keyword: string) {
  const params = new URLSearchParams();
  params.set(mode === 'orderNo' ? 'orderNo' : 'phone', keyword);
  return `/api/orders?${params.toString()}`;
}

/**
 * 訂單查詢與狀態即時追蹤。
 * 已連線 Supabase 時透過 Realtime 訂閱 repair_orders 變更即時刷新；
 * 未連線（Mock 模式）時自動回退為 20 秒輪詢，確保功能一致可用。
 */
export function useOrderTracking() {
  const [state, setState] = React.useState<TrackState>({
    orders: [],
    loading: false,
    searched: false,
    error: '',
    channel: 'idle',
    lastSyncedAt: null,
  });

  const activeQuery = React.useRef<{ mode: TrackMode; keyword: string } | null>(null);

  const fetchOrders = React.useCallback(async (mode: TrackMode, keyword: string, silent = false) => {
    if (!silent) setState((prev) => ({ ...prev, loading: true, error: '' }));

    const response = await fetch(buildQuery(mode, keyword)).catch((error: unknown) => {
      console.error('查詢維修訂單失敗', error);
      return null;
    });

    if (!response || !response.ok) {
      setState((prev) => ({
        ...prev,
        loading: false,
        searched: true,
        error: '查詢失敗，請稍後再試或致電 3188 6688。',
      }));
      return;
    }

    const data = (await response.json()) as { orders: RepairOrder[] };

    setState({
      orders: data.orders ?? [],
      loading: false,
      searched: true,
      error: '',
      channel: isSupabaseConfigured() ? 'realtime' : 'polling',
      lastSyncedAt: new Date().toISOString(),
    });
  }, []);

  const search = React.useCallback(
    (mode: TrackMode, keyword: string) => {
      activeQuery.current = { mode, keyword };
      void fetchOrders(mode, keyword);
    },
    [fetchOrders],
  );

  const reset = React.useCallback(() => {
    activeQuery.current = null;
    setState({
      orders: [],
      loading: false,
      searched: false,
      error: '',
      channel: 'idle',
      lastSyncedAt: null,
    });
  }, []);

  // Supabase Realtime 訂閱
  React.useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !state.searched) return;

    const channel = supabase
      .channel('repair-orders-tracking')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repair_orders' },
        () => {
          const query = activeQuery.current;
          if (query) void fetchOrders(query.mode, query.keyword, true);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [state.searched, fetchOrders]);

  // Mock 模式輪詢回退
  React.useEffect(() => {
    if (isSupabaseConfigured() || !state.searched) return;

    const timer = window.setInterval(() => {
      const query = activeQuery.current;
      if (query) void fetchOrders(query.mode, query.keyword, true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [state.searched, fetchOrders]);

  return { ...state, search, reset };
}
