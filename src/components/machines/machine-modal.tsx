'use client';

import React, { useState, useEffect } from 'react';
import { X, Cpu, AlertCircle } from 'lucide-react';
import { Machine, MachineStatus, MachineType } from '@/types';
import { useData } from '@/context/data-context';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null; // If null/undefined, mode is 'add'
  onSuccess?: () => void;
}

const MACHINE_TYPES: MachineType[] = [
  'PLC System',
  'CNC Machine',
  'Conveyor Belt',
  'Robotic Arm',
  'Packaging Machine',
  'Pumping Station',
  'Hydraulic Press',
  'Injection Molding',
];

const MACHINE_STATUSES: MachineStatus[] = ['Running', 'Stop', 'Alarm', 'Maintenance'];

export function MachineModal({ isOpen, onClose, machine, onSuccess }: MachineModalProps) {
  const { addMachine, updateMachine, checkMachineIdExists } = useData();

  const isEdit = !!machine;

  const [machineId, setMachineId] = useState('');
  const [machineName, setMachineName] = useState('');
  const [machineType, setMachineType] = useState<MachineType>('PLC System');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<MachineStatus>('Running');
  const [description, setDescription] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [protocol, setProtocol] = useState('Modbus TCP');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (machine) {
      setMachineId(machine.machine_id);
      setMachineName(machine.machine_name);
      setMachineType(machine.machine_type as MachineType);
      setLocation(machine.location);
      setStatus(machine.status);
      setDescription(machine.description || '');
      setIpAddress(machine.ip_address || '');
      setProtocol(machine.protocol || 'Modbus TCP');
    } else {
      setMachineId('');
      setMachineName('');
      setMachineType('PLC System');
      setLocation('');
      setStatus('Running');
      setDescription('');
      setIpAddress('192.168.1.');
      setProtocol('Modbus TCP');
    }
    setError(null);
  }, [machine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanId = machineId.trim().toUpperCase();
    const cleanName = machineName.trim();
    const cleanLocation = location.trim();

    if (!cleanId) {
      setError('กรุณาระบุรหัสเครื่องจักร (Machine ID)');
      return;
    }
    if (!cleanName) {
      setError('กรุณาระบุชื่อเครื่องจักร (Machine Name)');
      return;
    }
    if (!cleanLocation) {
      setError('กรุณาระบุตำแหน่งติดตั้ง (Location)');
      return;
    }

    // Check duplicate ID
    if (checkMachineIdExists(cleanId, machine?.id)) {
      setError(`รหัสเครื่องจักร '${cleanId}' ซ้ำกับเครื่องจักรที่มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && machine) {
        const res = await updateMachine(machine.id, {
          machine_id: cleanId,
          machine_name: cleanName,
          machine_type: machineType,
          location: cleanLocation,
          status,
          description: description.trim() || undefined,
          ip_address: ipAddress.trim() || undefined,
          protocol: protocol.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถแก้ไขข้อมูลเครื่องจักรได้');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addMachine({
          machine_id: cleanId,
          machine_name: cleanName,
          machine_type: machineType,
          location: cleanLocation,
          status,
          description: description.trim() || undefined,
          ip_address: ipAddress.trim() || undefined,
          protocol: protocol.trim() || undefined,
          installation_date: new Date().toISOString().split('T')[0],
        });

        if (!res.success) {
          setError(res.error || 'ไม่สามารถเพิ่มเครื่องจักรได้');
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
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white light:text-slate-900">
              {isEdit ? 'แก้ไขข้อมูลเครื่องจักร (Edit Machine)' : 'เพิ่มเครื่องจักรใหม่ (Add Machine Master)'}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500">
              กำหนดคุณลักษณะเฉพาะและสถานะ SCADA
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
            {/* Machine ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                รหัสเครื่องจักร (Machine ID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                placeholder="PLC-LINE-01"
                required
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">ต้องไม่ซ้ำกับในระบบ</p>
            </div>

            {/* Machine Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ชื่อเครื่องจักร (Machine Name) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="Main Assembly Conveyor"
                required
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                ประเภทเครื่องจักร (Machine Type) <span className="text-rose-400">*</span>
              </label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value as MachineType)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {MACHINE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                สถานะเครื่องจักร (Status) <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MachineStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                {MACHINE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              ตำแหน่งติดตั้ง (Location) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Building A - Section 2 (Packaging Zone)"
              required
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IP Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                PLC IP Address (Optional)
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.50"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Protocol */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Protocol (Optional)
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="Modbus TCP">Modbus TCP</option>
                <option value="EtherNet/IP">EtherNet/IP</option>
                <option value="Profinet">Profinet</option>
                <option value="OPC UA">OPC UA</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              คำอธิบายเพิ่มเติม (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เครื่องจักรสำหรับสายการผลิตหลัก เชื่อมต่อเซนเซอร์ตรวจจับรอบหมุน..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : isEdit ? 'อัปเดตเครื่องจักร' : 'บันทึกเครื่องจักร'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
