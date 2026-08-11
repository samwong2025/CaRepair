'use client';

import * as React from 'react';
import { getBrowserSupabase, isSupabaseConfigured } from '../supabase/client';
import type { RepairOrder, ShopOrder } from '../../types';
import { siteConfig } from '../../config/site';

export type TrackMode = 'orderNo' | 'phone';

export type TrackOrder = RepairOrder | ShopOrder;

interface TrackState {
  orders: TrackOrder[];
  loading: boolean;
  searched: boolean;
  error: string;
  /** 追蹤來源：realtime（Supabase 推播）或 polling（輪詢回退） */
  channel: 'realtime' | 'polling' | 'idle';
  lastSyncedAt: string | null;
}

const POLL_INTERVAL_MS = 20000;

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

    const params = new URLSearchParams();
    params.set(mode === 'orderNo' ? 'orderNo' : 'phone', keyword);
    const query = params.toString();

    // 同時查維修訂單與二手購買訂單，合併呈現
    const [repairRes, shopRes] = await Promise.all([
      fetch(`/api/orders?${query}`).catch(() => null),
      fetch(`/api/shop-orders?${query}`).catch(() => null),
    ]);

    if (!repairRes || !repairRes.ok) {
      setState((prev) => ({
        ...prev,
        loading: false,
        searched: true,
        error: `查詢失敗，請稍後再試或致電 ${siteConfig.hotline}。`,
      }));
      return;
    }

    const repairData = (await repairRes.json().catch(() => null)) as { orders: RepairOrder[] } | null;
    const shopData = (await shopRes?.json().catch(() => null)) as { orders: ShopOrder[] } | null;

    const merged: TrackOrder[] = [
      ...(repairData?.orders ?? []),
      ...(shopData?.orders ?? []),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setState({
      orders: merged,
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
