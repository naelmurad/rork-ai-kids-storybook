import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}

const MAX_LOGS = 300;

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function DebugConsole() {
  const originals = useRef<{ [K in LogLevel]: (...args: unknown[]) => void } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [onlyStoryLogs, setOnlyStoryLogs] = useState<boolean>(true);
  const [autoOpenOnGenerate, setAutoOpenOnGenerate] = useState<boolean>(true);

  const addLog = useCallback((level: LogLevel, args: unknown[]) => {
    try {
      const message = args
        .map((a) => {
          if (typeof a === 'string') return a;
          try { return JSON.stringify(a); } catch { return String(a); }
        })
        .join(' ');
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        level,
        message,
        timestamp: Date.now(),
      };
      setLogs((prev) => {
        const next = [...prev, entry];
        if (next.length > MAX_LOGS) next.splice(0, next.length - MAX_LOGS);
        return next;
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (originals.current) return;
    originals.current = {
      log: console.log.bind(console),
      info: console.info?.bind(console) ?? console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };

    const wrap = (level: LogLevel) =>
      (...args: unknown[]) => {
        try { originals.current?.[level](...args); } catch {}
        addLog(level, args);
      };

    console.log = wrap('log');
    console.info = wrap('info');
    console.warn = wrap('warn');
    console.error = wrap('error');

    return () => {
      if (originals.current) {
        console.log = originals.current.log;
        console.info = originals.current.info;
        console.warn = originals.current.warn;
        console.error = originals.current.error;
      }
    };
  }, [addLog]);

  // Auto-open logic moved to useEffect to prevent render-time state updates
  useEffect(() => {
    if (autoOpenOnGenerate && !visible && logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      if (/STORY STORE|STORY CREATION|Story generation|generateStory/i.test(latestLog.message)) {
        setVisible(true);
      }
    }
  }, [logs, autoOpenOnGenerate, visible]);

  const filteredLogs = useMemo(() => {
    if (!onlyStoryLogs) return logs;
    const pattern = /(STORY STORE|STORY CREATION|Story generation|generateStory|pages with images|illustration)/i;
    return logs.filter((l) => pattern.test(l.message));
  }, [logs, onlyStoryLogs]);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const clear = useCallback(() => setLogs([]), []);

  return (
    <>
      <TouchableOpacity
        testID="debug-fab"
        accessibilityLabel="Open Logs"
        onPress={open}
        activeOpacity={0.9}
        style={styles.fab}
      >
        <Text style={styles.fabText}>Logs</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Debug Console</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setOnlyStoryLogs((v) => !v)}>
                <Text style={styles.headerBtnText}>{onlyStoryLogs ? 'All' : 'Story'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setAutoOpenOnGenerate((v) => !v)}>
                <Text style={styles.headerBtnText}>{autoOpenOnGenerate ? 'Auto' : 'Manual'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={clear}>
                <Text style={styles.headerBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Platform: {Platform.OS}</Text>
            <Text style={styles.metaText}>Total: {logs.length}</Text>
            <Text style={styles.metaText}>Shown: {filteredLogs.length}</Text>
          </View>

          <ScrollView style={styles.logArea} contentContainerStyle={styles.logContent} testID="debug-log-scroll">
            {filteredLogs.length === 0 ? (
              <Text style={styles.empty}>No logs yet. Trigger story generation to see live logs.</Text>
            ) : (
              filteredLogs.map((l) => {
                const color = l.level === 'error' ? '#EF4444' : l.level === 'warn' ? '#F59E0B' : '#10B981';
                return (
                  <View key={l.id} style={styles.row}>
                    <Text style={[styles.time, { color }]}>{formatTime(l.timestamp)}</Text>
                    <Text selectable style={styles.msg}>{l.message}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    opacity: 0.85,
    zIndex: 9999,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0B1020',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  logArea: {
    flex: 1,
  },
  logContent: {
    padding: 12,
    gap: 8,
  },
  row: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#111827',
  },
  time: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  msg: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
});
