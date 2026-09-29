'use client';

import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle, Package } from 'lucide-react';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '@/types';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: MaintenanceRecord | null;
  onSuccess?: () => void;
}

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'Preventive',
  'Corrective',
  'Predictive',
  'Overhaul',
  'Emergency Repair',
];

const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'Planned',
  'In Progress',
  'Waiting Part',
  'Completed',
  'Cancelled',
];

export function MaintenanceModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: MaintenanceModalProps) {
  const { machines, profiles, addMaintenance, updateMaintenance } = useData();
  const { user } = useAuth();

  const isEdit = !!record;

  const [machineId, setMachineId] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('Preventive');
  const [problem, setProblem] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('In Progress');
  const [cost, setCost] = useState<number>(0);
  const [sparePartUsed, setSparePartUsed] = useState('');
  const [sparePartChangeRequest, setSparePartChangeRequest] = useState(false);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setMachineId(record.machine_id);
      setTechnicianId(record.technician_id || '');
      setMaintenanceType(record.maintenance_type);
      setProblem(record.problem);
      setActionTaken(record.action_taken);
      setMaintenanceDate(record.maintenance_date ? record.maintenance_date.split('T')[0] : '');
      setStatus(record.status);
      setCost(record.cost || 0);
      setSparePartUsed(record.spare_part_used || '');
      setSparePartChangeRequest(!!record.spare_part_change_request);
      setNotes(record.notes || '');
    } else {
      setMachineId(machines[0]?.id || '');
      setTechnicianId(user?.id || profiles[0]?.id || '');
      setMaintenanceType('Preventive');
      setProblem('');
      setActionTaken('');
      setMaintenanceDate(new Date().toISOString().split('T')[0]);
      setStatus('In Progress');
      setCost(0);
      setSparePartUsed('');
      setSparePartChangeRequest(false);
      setNotes('');
    }
    setError(null);
  }, [record, machines, profiles, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanProblem = problem.trim();
    const cleanAction = actionTaken.trim();

    if (!machineId) {
      setError('กรุณาเลือกเครื่องจักร');
      return;
    }
    if (!cleanProblem) {
      setError('กรุณาระบุปัญหาที่พบ (Problem)');
      return;
    }
    if (!cleanAction) {
      setError('กรุณาระบุวิธีดำเนินการแก้ไข (Action Taken)');
      return;
    }
    if (!maintenanceDate) {
      setError('กรุณาระบุวันที่ดำเนินการ');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && record) {
        const res = await updateMaintenance(record.id, {
          machine_id: machineId,
          technician_id: technicianId,
          maintenance_type: maintenanceType,
          problem: cleanProblem,
          action_taken: cleanAction,
          maintenance_date: maintenanceDate,
          status,
          cost: Number(cost) || 0,
          spare_part_used: sparePartUsed.trim() || undefined,
          spare_part_change_request: sparePartChangeRequest,
          notes: notes.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถแก้ไขข้อมูล Maintenance ได้');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addMaintenance({
          machine_id: machineId,
          technician_id: technicianId || user?.id || 'demo-tech',
          maintenance_type: maintenanceType,
          problem: cleanProblem,
          action_taken: cleanAction,
          maintenance_date: maintenanceDate,
          status,
          cost: Number(cost) || 0,
          spare_part_used: sparePartUsed.trim() || undefined,
          spare_part_change_request: sparePartChangeRequest,
          notes: notes.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถบันทึก Maintenance ได้');
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
      <div className="relative w-full max-w-xl p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl light:bg-white light:border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white light:hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white light:text-slate-900">
              {isEdit ? 'แก้ไขงานซ่อมบำรุง (Edit Maintenance)' : 'บันทึกงานซ่อมบำรุงรักษา (New Maintenance)'}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              บันทึกวิธีแก้ปัญหา, อะไหล่ที่ใช้, และคำขอเปลี่ยนอะไหล่ (Waiting Part Change Request)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                เครื่องจักร <span className="text-rose-400">*</span>
              </label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.machine_id}] {m.machine_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Maintenance Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ประเภทการบำรุงรักษา <span className="text-rose-400">*</span>
              </label>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              ปัญหาที่พบ (Problem) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="ระบบสายพานมีเสียงดังผิดปกติและเซนเซอร์ความเร็วอ่านค่าแกว่ง"
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              วิธีดำเนินการแก้ไข (Action Taken) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="ปรับตั้งความตึงของสายพาน ตรวจสอบลูกปืนและหล่อลื่นจาระบีสังเคราะห์"
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Technician */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ผู้ปฏิบัติงาน (Technician) <span className="text-rose-400">*</span>
              </label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                วันที่ดำเนินการ <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                สถานะงาน (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {MAINTENANCE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Spare Part Used */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                อะไหล่ที่นำมาใช้ (Spare Part Used)
              </label>
              <input
                type="text"
                value={sparePartUsed}
                onChange={(e) => setSparePartUsed(e.target.value)}
                placeholder="ลูกปืน SKF 6205, ซีลยาง O-Ring"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ค่าใช้จ่ายโดยประมาณ (Cost THB)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                placeholder="1500"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Spare Part Change Request Checkbox (Bonus Feature) */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <input
              type="checkbox"
              id="partChangeRequest"
              checked={sparePartChangeRequest}
              onChange={(e) => {
                setSparePartChangeRequest(e.target.checked);
                if (e.target.checked && status !== 'Completed') {
                  setStatus('Waiting Part');
                }
              }}
              className="mt-0.5 rounded border-amber-500 text-amber-600 focus:ring-amber-500 h-4 w-4"
            />
            <label htmlFor="partChangeRequest" className="text-xs text-amber-200 cursor-pointer">
              <span className="font-bold flex items-center gap-1 text-amber-300">
                <Package className="w-3.5 h-3.5" /> คำขอเบิก/สั่งซื้ออะไหล่ใหม่ (Waiting Part Change Request)
              </span>
              <span className="text-[11px] text-amber-300/80 block mt-0.5">
                เลือกช่องนี้หากต้องรออะไหล่จากคลังสินค้า ระบบจะปรับสถานะงานเป็น &quot;Waiting Part&quot; โดยอัตโนมัติ
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              หมายเหตุเพิ่มเติม (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="แนะนำให้ตรวจวัดรอบหมุนอีกครั้งใน 7 วัน"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : isEdit ? 'อัปเดตงานบำรุงรักษา' : 'บันทึกงานบำรุงรักษา'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
