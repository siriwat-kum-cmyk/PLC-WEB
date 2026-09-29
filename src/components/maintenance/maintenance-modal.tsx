"use client";

import React, { useState, useEffect } from "react";
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus, Machine } from "@/types";
import { X, Wrench, Save, AlertCircle, Package } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MaintenanceRecord, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
  initialData?: MaintenanceRecord | null;
  machines: Machine[];
}

export function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  machines,
}: MaintenanceModalProps) {
  const { user } = useAuth();
  const [machineId, setMachineId] = useState("");
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("Preventive (PM)");
  const [problem, setProblem] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("Pending");
  const [scheduledDate, setScheduledDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMachineId(initialData.machine_id);
      setMaintenanceType(initialData.maintenance_type);
      setProblem(initialData.problem);
      setActionTaken(initialData.action_taken || "");
      setTechnicianName(initialData.technician_name);
      setStatus(initialData.status);
      setScheduledDate(initialData.scheduled_date);
      setCompletedDate(initialData.completed_date || "");
    } else {
      setMachineId(machines[0]?.id || "");
      setMaintenanceType("Preventive (PM)");
      setProblem("");
      setActionTaken("");
      setTechnicianName(user?.full_name || "Somchai Maintenance");
      setStatus("Pending");
      setScheduledDate(new Date().toISOString().split("T")[0]);
      setCompletedDate("");
    }
    setErrors({});
  }, [initialData, isOpen, machines, user]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!machineId) {
      errs.machineId = "กรุณาเลือกเครื่องจักร (Machine is required)";
    }
    if (!problem.trim()) {
      errs.problem = "รายละเอียดปัญหา/งานซ่อมบำรุงห้ามเว้นว่าง";
    }
    if (!technicianName.trim()) {
      errs.technicianName = "ชื่อช่างผู้รับผิดชอบห้ามเว้นว่าง";
    }
    if (!scheduledDate) {
      errs.scheduledDate = "กรุณาระบุวันที่เข้าซ่อมบำรุง";
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
      maintenance_type: maintenanceType,
      problem: problem.trim(),
      action_taken: actionTaken.trim() || undefined,
      technician_name: technicianName.trim(),
      status,
      scheduled_date: scheduledDate,
      completed_date: status === "Completed" ? completedDate || new Date().toISOString().split("T")[0] : undefined,
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
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                {initialData ? "แก้ไขใบสั่งซ่อมบำรุง (Edit Maintenance)" : "เปิดใบสั่งซ่อมบำรุงใหม่ (New Work Order)"}
              </h3>
              <p className="text-[11px] text-slate-400">Preventive & Breakdown Maintenance Management</p>
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
                เครื่องจักร (Target Machine) <span className="text-rose-400">*</span>
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

            {/* Maintenance Type (PM, BM, CM) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                ประเภทงานบำรุงรักษา (Type) <span className="text-rose-400">*</span>
              </label>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-semibold"
              >
                <option value="Preventive (PM)">🟢 Preventive (PM) - บำรุงรักษาเชิงป้องกัน</option>
                <option value="Breakdown (BM)">🔴 Breakdown (BM) - ซ่อมด่วนเมื่อเสีย</option>
                <option value="Corrective (CM)">🔵 Corrective (CM) - ปรับปรุงแก้ไข</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status (including Waiting Part CR requirement!) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                สถานะงานซ่อม (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-bold"
              >
                <option value="Pending">⚪ Pending (รอดำเนินการ)</option>
                <option value="In Progress">🔵 In Progress (กำลังดำเนินการ)</option>
                <option value="Waiting Part">🟣 Waiting Part (รอเบิกอะไหล่ - Change Request)</option>
                <option value="Completed">🟢 Completed (ซ่อมเสร็จสมบูรณ์)</option>
              </select>
            </div>

            {/* Technician Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                ช่างผู้รับผิดชอบ (Technician) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="ชื่อช่างเทคนิค หรือวิศวกร..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900"
              />
              {errors.technicianName && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.technicianName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                วันที่ตามแผน (Scheduled Date) <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono light:bg-slate-50 light:text-slate-900"
              />
              {errors.scheduledDate && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.scheduledDate}</p>
              )}
            </div>

            {/* Completed Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                วันที่ทำเสร็จ (Completed Date)
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                disabled={status !== "Completed"}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-40 light:bg-slate-50 light:text-slate-900"
              />
            </div>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              รายละเอียดปัญหา / ขอบเขตงาน (Problem Description) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="ระบุอาการผิดปกติ หรือรายการเช็กลิสต์ที่ต้องดำเนินการ..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none light:bg-slate-50 light:text-slate-900"
            />
            {errors.problem && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.problem}</p>
            )}
          </div>

          {/* Action Taken (including notes if Waiting Part) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              การปฏิบัติงาน / หมายเหตุอะไหล่ (Action Taken & Notes)
            </label>
            <textarea
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="บันทึกสิ่งที่ดำเนินการ หรือรายละเอียดชิ้นส่วนที่รอเบิก (เช่น รหัสอะไหล่ PO, รุ่นโมดูล)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none light:bg-slate-50 light:text-slate-900"
            />
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "กำลังบันทึก..." : "บันทึกงานซ่อมบำรุง"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
