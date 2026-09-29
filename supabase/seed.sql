-- ==========================================================
-- SCADA ALARM & MAINTENANCE MANAGEMENT SYSTEM - SEED DATA
-- ==========================================================

-- Insert Sample Machines
INSERT INTO public.machines (id, machine_id, name, type, location, status, description, installed_at) VALUES
('m1111111-1111-1111-1111-111111111111', 'CNC-01', '5-Axis High Precision CNC Milling Center', 'CNC Machining', 'Bay A - Metal Fabrication', 'Running', 'DMG MORI 5-Axis spindle milling machine for aerospace turbine blades', '2023-01-15'),
('m2222222-2222-2222-2222-222222222222', 'ROB-02', 'KUKA KR-210 Robotic Chassis Spot Welder', 'Industrial Robot', 'Bay B - Body Assembly', 'Alarm', '6-Axis heavy payload articulated robot with integrated servo spot weld gun', '2023-03-20'),
('m3333333-3333-3333-3333-333333333333', 'CONV-03', 'High-Speed Modular Roller Pallet Conveyor', 'Conveyor Line', 'Bay C - Packaging & Logistics', 'Running', 'Automated variable frequency drive sorting conveyor system with RFID tracking', '2022-11-10'),
('m4444444-4444-4444-4444-444444444444', 'INJ-04', 'Engel 350-Ton Precision Plastic Injection Press', 'Injection Molding', 'Bay D - Polymer Molding', 'Maintenance', 'All-electric tie-bar-less injection molding machine for automotive connectors', '2023-06-05'),
('m5555555-5555-5555-5555-555555555555', 'PACK-05', 'End-of-Line Automated Robotic Case Packer', 'Packaging Machine', 'Bay C - Packaging & Logistics', 'Stop', 'High speed delta robot picking and continuous carton case sealer', '2023-08-12'),
('m6666666-6666-6666-6666-666666666666', 'AGV-06', 'Autonomous Guided Vehicle (SLAM LiDAR AMR)', 'Material Handling', 'Warehouse & Main Aisle', 'Running', 'Natural feature navigation 1000kg payload autonomous transport robot', '2024-01-10')
ON CONFLICT (machine_id) DO NOTHING;

-- Insert Sample Alarms
INSERT INTO public.alarms (id, machine_id, alarm_code, description, severity, triggered_at, cause, status, resolution, acknowledged_by) VALUES
('al-101', 'm2222222-2222-2222-2222-222222222222', 'ALM-E702', 'Robot Axis 3 Servo Motor Over-Temperature Warning (>95°C)', 'Critical', NOW() - INTERVAL '25 minutes', 'Cooling fan filter clogged with weld spatter; ambient temperature in cell high', 'Open', NULL, NULL),
('al-102', 'm4444444-4444-4444-4444-444444444444', 'ALM-HYD44', 'Hydraulic Barrel Clamping Pressure Below Safety Threshold', 'Major', NOW() - INTERVAL '2 hours', 'Proportional pressure valve seal ring micro-leak detected during clamp toggle', 'In Progress', 'Replaced high pressure O-ring; recalibrating transducer feedback', 'Somchai Maintenance (Technician)'),
('al-103', 'm1111111-1111-1111-1111-111111111111', 'ALM-SPN01', 'Spindle High Speed Vibration Sensor Upper Harmonic Alert', 'Warning', NOW() - INTERVAL '8 hours', 'Tool holder taper surface dirt accumulation causing dynamic unbalance', 'Closed', 'Cleaned HSK tool shank and spindle bore with solvent; vibration normal at 18000 RPM', 'Somchai Maintenance (Technician)'),
('al-104', 'm3333333-3333-3333-3333-333333333333', 'ALM-PHT09', 'Pallet Sensor Infeed Jam Timeout Sensor 12B Not Triggered', 'Minor', NOW() - INTERVAL '12 hours', 'Misaligned tote box caught on roller guide rail edge', 'Closed', 'Repositioned tote box and reset interlock reset button on local HMI', 'Somchai Maintenance (Technician)')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Maintenance Records (Including Waiting Part Change Request)
INSERT INTO public.maintenance_records (id, machine_id, maintenance_type, problem, action_taken, technician_name, scheduled_date, status, cost) VALUES
('mn-201', 'm4444444-4444-4444-4444-444444444444', 'Corrective', 'Main hydraulic pump seal deterioration and barrel thermal check', 'Inspected pump chamber, ordered genuine Parker hydraulic seal kit (Part #PK-78210)', 'Somchai Maintenance', CURRENT_DATE, 'Waiting Part', 12500.00),
('mn-202', 'm1111111-1111-1111-1111-111111111111', 'Preventive', 'Quarterly 500-Hour Preventive Maintenance & Ball Screw Lubrication', 'Flushed old grease, injected Klüber specialty high-speed grease, checked axis backlash', 'Somchai Maintenance', CURRENT_DATE + INTERVAL '3 days', 'Scheduled', 8000.00),
('mn-203', 'm2222222-2222-2222-2222-222222222222', 'Breakdown', 'Axis 3 servo cooling fan failure caused motor overheating trip', 'Replaced 24VDC SanAce high static pressure fan; cleaned heatsink duct', 'Somchai Maintenance', CURRENT_DATE, 'In Progress', 4500.00),
('mn-204', 'm3333333-3333-3333-3333-333333333333', 'Preventive', 'Monthly roller chain tension adjustment and photoelectric sensor cleaning', 'Tensioned drive roller chain to 15mm deflection; cleaned optical lenses with isopropyl', 'Somchai Maintenance', CURRENT_DATE - INTERVAL '10 days', 'Completed', 2000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Audit Logs
INSERT INTO public.audit_logs (id, user_email, action, entity_type, entity_id, details) VALUES
('lg-01', 'admin@automation.local', 'UPDATE_STATUS', 'machine', 'ROB-02', 'Changed machine ROB-02 status to "Alarm" due to over-temperature alert'),
('lg-02', 'tech@automation.local', 'CHANGE_REQUEST_STATUS', 'maintenance', 'mn-201', 'Set maintenance order mn-201 status to "Waiting Part" (Parker seal kit #PK-78210)'),
('lg-03', 'tech@automation.local', 'CLOSE_ALARM', 'alarm', 'ALM-SPN01', 'Closed alarm ALM-SPN01 after spindle bore taper cleaning'),
('lg-04', 'admin@automation.local', 'SYSTEM_INITIALIZATION', 'auth', 'SYSTEM', 'Initialized SCADA Automation Database with 6 active industrial machines')
ON CONFLICT (id) DO NOTHING;
