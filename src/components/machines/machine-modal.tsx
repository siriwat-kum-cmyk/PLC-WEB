"use client";

import React, { useState, useEffect } from "react";
import { Machine, MachineStatus } from "@/types";
import { X, AlertCircle, Save, Cpu } from "lucide-react";

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Machine, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
  initialData?: Machine | null;
  existingMachineIds: string[];
}

export function MachineModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingMachineIds,
}: MachineModalProps) {
  const [machineId, setMachineId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("CNC");
  const [location, setLocation] = useState("Line 1 - Machining");
  const [status, setStatus] = useState<MachineStatus>("Running");
  const [description, setDescription] = useState("");
  const [installedAt, setInstalledAt] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMachineId(initialData.machine_id);
      setName(initialData.name);
      setType(initialData.type);
      setLocation(initialData.location);
      setStatus(initialData.status);
      setDescription(initialData.description || "");
      setInstalledAt(initialData.installed_at || "");
    } else {
      setMachineId("");
      setName("");
      setType("PLC Conveyor");
      setLocation("Line 1 - Machining");
      setStatus("Running");
      setDescription("");
      setInstalledAt(new Date().toISOString().split("T")[0]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    // 3.7 Validation: Cannot be empty
    if (!machineId.trim()) {
      errs.machineId = "รหัสเครื่องจักร (Machine ID) ห้ามเว้นว่าง";
    } else {
      // 3.7 Validation: Duplicate check
      const normalized = machineId.trim().toLowerCase();
      const isDuplicate = existingMachineIds.some(
        (id) =>
          id.trim().toLowerCase() === normalized &&
          (!initialData || initialData.machine_id.trim().toLowerCase() !== normalized)
      );
      if (isDuplicate) {
        errs.machineId = `รหัสเครื่องจักร '${machineId}' ซ้ำกับเครื่องอื่นในระบบ ห้ามซ้ำกัน`;
      }
    }

    if (!name.trim()) {
      errs.name = "ชื่อเครื่องจักร (Machine Name) ห้ามเว้นว่าง";
    }

    if (!type.trim()) {
      errs.type = "ประเภทเครื่องจักรห้ามเว้นว่าง";
    }

    if (!location.trim()) {
      errs.location = "ตำแหน่งที่ตั้ง (Location) ห้ามเว้นว่าง";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const res = await onSubmit({
      machine_id: machineId.trim().toUpperCase(),
      name: name.trim(),
      type: type.trim(),
      location: location.trim(),
      status,
      description: description.trim() || undefined,
      installed_at: installedAt || undefined,
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
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                {initialData ? "แก้ไขเครื่องจักร (Edit Machine)" : "เพิ่มเครื่องจักรใหม่ (Add Machine)"}
              </h3>
              <p className="text-[11px] text-slate-400">Machine Master Registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                Machine ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value.toUpperCase())}
                placeholder="e.g. CNC-02, ROB-03"
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors light:bg-slate-50 light:text-slate-900 ${
                  errors.machineId ? "border-rose-500" : "border-slate-700/80"
                }`}
              />
              {errors.machineId && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.machineId}</span>
                </p>
              )}
            </div>

            {/* Machine Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                Machine Name (ชื่อเครื่อง) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5-Axis Milling Center"
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:text-slate-900 ${
                  errors.name ? "border-rose-500" : "border-slate-700/80"
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                ประเภท (Type) <span className="text-rose-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900"
              >
                <option value="PLC Conveyor">PLC Conveyor (สายพานลำเลียง)</option>
                <option value="CNC">CNC (เครื่องกัด/กลึง CNC)</option>
                <option value="Robotic Arm">Robotic Arm (แขนกลอุตสาหกรรม)</option>
                <option value="SMT Placement">SMT Placement (วางชิปอิเล็กทรอนิกส์)</option>
                <option value="Packaging">Packaging (บรรจุภัณฑ์)</option>
                <option value="Molding">Molding (เครื่องฉีดพลาสติก)</option>
                <option value="Sensor / Vision">Sensor / Vision (กล้องตรวจสอบ)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                ตำแหน่งที่ตั้ง (Location) <span className="text-rose-400">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900"
              >
                <option value="Line 1 - Machining">Line 1 - Machining</option>
                <option value="Line 1 - Welding">Line 1 - Welding</option>
                <option value="Line 2 - Assembly">Line 2 - Assembly</option>
                <option value="Line 3 - Plastics">Line 3 - Plastics</option>
                <option value="Cleanroom A">Cleanroom A</option>
                <option value="Warehouse Bay 3">Warehouse Bay 3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status (Requirement 3.2: Running, Stop, Alarm, Maintenance) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                สถานะการทำงาน (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MachineStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-medium light:bg-slate-50 light:text-slate-900"
              >
                <option value="Running">🟢 Running (กำลังทำงาน)</option>
                <option value="Stop">⚪ Stop (หยุดทำงาน)</option>
                <option value="Alarm">🔴 Alarm (มีสัญญาณเตือน)</option>
                <option value="Maintenance">🟡 Maintenance (กำลังซ่อมบำรุง)</option>
              </select>
            </div>

            {/* Installation Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
                วันที่ติดตั้ง (Install Date)
              </label>
              <input
                type="date"
                value={installedAt}
                onChange={(e) => setInstalledAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono light:bg-slate-50 light:text-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 light:text-slate-700">
              รายละเอียดและสเปกเครื่องจักร (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุสเปกเครื่องจักร ผู้ผลิต รุ่น หรือหน้าที่การทำงาน..."
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
              ยกเลิก (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล (Save)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
