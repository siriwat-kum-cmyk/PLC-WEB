'use client';

import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { Alarm, AlarmStatus } from '@/types';
import { useData } from '@/context/data-context';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: Alarm | null;
  onSuccess?: () => void;
}

export function StatusUpdateModal({ isOpen, onClose, alarm, onSuccess }: StatusUpdateModalProps) {
  const { updateAlarmStatus } = useData();

  const [status, setStatus] = useState<AlarmStatus>('In Progress');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !alarm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateAlarmStatus(alarm.id, status, note.trim() || undefined);
      if (!res.success) {
        setError(res.error || 'ไม่สามารถปรับปรุงสถานะได้');
        setIsSubmitting(false);
        return;
      }
      onSuccess?.();
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาดในการปรับปรุงสถานะ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl light:bg-white light:border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white light:hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800 light:border-slate-200">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white light:text-slate-900">
              เปลี่ยนสถานะ Alarm Incident
            </h3>
            <p className="text-xs text-slate-400">
              รหัส: <span className="font-mono text-cyan-400">{alarm.alarm_code}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 mb-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              สถานะใหม่ (New Status)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Open', 'In Progress', 'Closed'] as AlarmStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    status === st
                      ? st === 'Closed'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : st === 'In Progress'
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 light:bg-slate-50 light:border-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              บันทึกการแก้ไข / สาเหตุ (Cause / Resolution Note)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุแนวทางที่ช่างเทคนิคดำเนินการตรวจสอบหรือเปลี่ยนอุปกรณ์..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg light:bg-slate-200 light:text-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันเปลี่ยนสถานะ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
