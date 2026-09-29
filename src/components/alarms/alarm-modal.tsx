"use client";

import React, { useState, useEffect } from "react";
import { Alarm, AlarmSeverity, AlarmStatus, Machine } from "@/types";
import { X, AlertTriangle, Save, CheckCircle } from "lucide-react";

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Alarm, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
  initialData?: Alarm | null;
  machines: Machine[];
}

export function AlarmModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  machines,
}: AlarmModalProps) {
  const [machineId, setMachineId] = useState("");
  const [alarmCode, setAlarmCode] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<AlarmSeverity>("High");
  const [status, setStatus] = useState<AlarmStatus>("Open");
  const [cause, setCause] = useState("");
  const [resolution, setResolution] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMachineId(initialData.machine_id);
      setAlarmCode(initialData.alarm_code);
      setDescription(initialData.description);
      setSeverity(initialData.severity);
      setStatus(initialData.status);
      setCause(initialData.cause || "");
      setResolution(initialData.resolution || "");
    } else {
      setMachineId(machines[0]?.id || "");
      setAlarmCode("");
      setDescription("");
      setSeverity("High");
      setStatus("Open");
      setCause("");
      setResolution("");
    }
    setErrors({});
  }, [initialData, isOpen, machines]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!machineId) {
      errs.machineId = "กรุณาเลือกเครื่องจักร (Machine is required)";
    }
    if (!alarmCode.trim()) {
      errs.alarmCode = "รหัสสัญญาณเตือน (Alarm Code) ห้ามเว้นว่าง";
    }
    if (!description.trim()) {
      errs.description = "คำอธิบายอาการเตือน (Description) ห้ามเว้นว่าง";
    }

    if (status === "Closed" && !resolution.trim()) {
      errs.resolution = "การปิด Alarm ต้องระบุแนวทางการแก้ไข (Resolution)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const res = await onSubmit({
      machine_id: machineId,
      alarm_code: alarmCode.trim().toUpperCase(),
      description: description.trim(),
      severity,
      status,
      cause: cause.trim() || undefined,
      resolution: resolution.trim() || undefined,
      triggered_at: initialData?.triggered_at || new Date().toISOString(),
      resolved_at: status === "Closed" ? new Date().toISOString() : undefined,
    });

    setSubmitting(false);
    if (res.success) {
      onClose();
    } else if (res.error) {
      setErrors((prev) => ({ ...prev, form: res.error! }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121824] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden light:bg-white light:border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                {initialData ? "อัปเดตสัญญาณเตือน (Update Alarm)" : "แจ้งเตือนสัญญาณ Alarm ใหม่ (Trigger Alarm)"}
              </h3>
              <p className="text-[11px] text-slate-400">Alarm Incident & Resolution Tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Machine */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                เครื่องจักรที่เกิดปัญหา (Machine) <span className="text-rose-400">*</span>
              </label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.machine_id} - {m.name}
                  </option>
                ))}
              </select>
              {errors.machineId && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.machineId}</p>
              )}
            </div>

            {/* Alarm Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                รหัส Alarm Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={alarmCode}
                onChange={(e) => setAlarmCode(e.target.value.toUpperCase())}
                placeholder="e.g. ERR-204, WRN-012"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono light:bg-slate-50 light:text-slate-900"
              />
              {errors.alarmCode && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.alarmCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                ระดับความรุนแรง (Severity) <span className="text-rose-400">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-semibold"
              >
                <option value="Critical">🔴 Critical (วิกฤต - เครื่องหยุดทันที)</option>
                <option value="High">🟠 High (สูง - กระทบสายการผลิต)</option>
                <option value="Medium">🟡 Medium (ปานกลาง)</option>
                <option value="Low">🔵 Low (ต่ำ - เตือนล่วงหน้า)</option>
              </select>
            </div>

            {/* Status (Requirement 3.3: Open, In Progress, Closed) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                สถานะ Alarm (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AlarmStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-semibold"
              >
                <option value="Open">🔴 Open (รอตรวจสอบ)</option>
                <option value="In Progress">🟡 In Progress (กำลังเข้าแก้ไข)</option>
                <option value="Closed">🟢 Closed (แก้ไขเรียบร้อย/ปิดงาน)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              รายละเอียดข้อผิดพลาด (Alarm Description) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อความแจ้งเตือน เช่น Motor Overheat, Vacuum Pressure Drop"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Root Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              สาเหตุของปัญหา (Root Cause)
            </label>
            <textarea
              rows={2}
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              placeholder="เช่น ฝุ่นอุดตันพัดลมระบายความร้อน, เซนเซอร์หลุดจากตำแหน่ง..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none light:bg-slate-50 light:text-slate-900"
            />
          </div>

          {/* Resolution (Mandatory if Closed) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              วิธีการแก้ไข (Action Taken / Resolution)
              {status === "Closed" && <span className="text-rose-400 ml-1">* (จำเป็นเมื่อปิดงาน)</span>}
            </label>
            <textarea
              rows={2}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="บันทึกสิ่งที่ดำเนินการ เช่น เปลี่ยนไส้กรอง, ปรับตั้งศูนย์ใหม่..."
              className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none light:bg-slate-50 light:text-slate-900 ${
                errors.resolution ? "border-rose-500" : "border-slate-700/80"
              }`}
            />
            {errors.resolution && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.resolution}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "กำลังบันทึก..." : "บันทึก Alarm"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
