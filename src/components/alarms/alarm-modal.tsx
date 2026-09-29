'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { Alarm, AlarmSeverity, AlarmStatus } from '@/types';
import { useData } from '@/context/data-context';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm?: Alarm | null;
  onSuccess?: () => void;
}

const SEVERITIES: AlarmSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: AlarmStatus[] = ['Open', 'In Progress', 'Closed'];

export function AlarmModal({ isOpen, onClose, alarm, onSuccess }: AlarmModalProps) {
  const { machines, addAlarm, updateAlarm } = useData();

  const isEdit = !!alarm;

  const [machineId, setMachineId] = useState('');
  const [alarmCode, setAlarmCode] = useState('');
  const [alarmDescription, setAlarmDescription] = useState('');
  const [severity, setSeverity] = useState<AlarmSeverity>('High');
  const [status, setStatus] = useState<AlarmStatus>('Open');
  const [cause, setCause] = useState('');
  const [occurredAt, setOccurredAt] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alarm) {
      setMachineId(alarm.machine_id);
      setAlarmCode(alarm.alarm_code);
      setAlarmDescription(alarm.alarm_description);
      setSeverity(alarm.severity);
      setStatus(alarm.status);
      setCause(alarm.cause || '');
      setOccurredAt(alarm.occurred_at ? new Date(alarm.occurred_at).toISOString().slice(0, 16) : '');
    } else {
      setMachineId(machines[0]?.id || '');
      setAlarmCode('ALM-');
      setAlarmDescription('');
      setSeverity('High');
      setStatus('Open');
      setCause('');
      setOccurredAt(new Date().toISOString().slice(0, 16));
    }
    setError(null);
  }, [alarm, machines, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = alarmCode.trim().toUpperCase();
    const cleanDesc = alarmDescription.trim();

    if (!machineId) {
      setError('กรุณาเลือกเครื่องจักรที่เกิด Alarm');
      return;
    }
    if (!cleanCode) {
      setError('กรุณาระบุรหัส Alarm (Alarm Code)');
      return;
    }
    if (!cleanDesc) {
      setError('กรุณาระบุรายละเอียดการแจ้งเตือน (Alarm Description)');
      return;
    }

    setIsSubmitting(true);

    try {
      const dateIso = occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString();

      if (isEdit && alarm) {
        const res = await updateAlarm(alarm.id, {
          machine_id: machineId,
          alarm_code: cleanCode,
          alarm_description: cleanDesc,
          severity,
          status,
          cause: cause.trim() || undefined,
          occurred_at: dateIso,
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถแก้ไข Alarm ได้');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addAlarm({
          machine_id: machineId,
          alarm_code: cleanCode,
          alarm_description: cleanDesc,
          severity,
          status,
          cause: cause.trim() || undefined,
          occurred_at: dateIso,
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถเพิ่ม Alarm ได้');
          setIsSubmitting(false);
          return;
        }
      }

      onSuccess?.();
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl light:bg-white light:border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white light:hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white light:text-slate-900">
              {isEdit ? 'แก้ไขข้อมูล Alarm Incident' : 'บันทึกเหตุการณ์แจ้งเตือนใหม่ (New Alarm)'}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              เชื่อมโยงข้อมูลกับ Machine Master และกำหนดระดับความรุนแรง
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Machine */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              เครื่องจักรที่เกิด Alarm <span className="text-rose-400">*</span>
            </label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.machine_id}] {m.machine_name} ({m.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alarm Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                รหัส Alarm (Alarm Code) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={alarmCode}
                onChange={(e) => setAlarmCode(e.target.value)}
                placeholder="ALM-E04"
                required
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ระดับความรุนแรง (Severity) <span className="text-rose-400">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
                className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              รายละเอียดการแจ้งเตือน (Alarm Description) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={alarmDescription}
              onChange={(e) => setAlarmDescription(e.target.value)}
              placeholder="มอเตอร์สายพานลำเลียงอุณหภูมิสูงเกินพิกัด (Over-temperature trip)"
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                สถานะ (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AlarmStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Occurred At */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                วันและเวลาที่เกิด (Date/Time)
              </label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              สาเหตุที่พบ (Cause / Root Problem)
            </label>
            <input
              type="text"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              placeholder="พัดลมระบายความร้อนติดขัด หรือ แผ่นกรองอากาศอุดตัน"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors light:bg-slate-200 light:text-slate-700 light:hover:bg-slate-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : isEdit ? 'อัปเดต Alarm' : 'บันทึก Alarm Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
