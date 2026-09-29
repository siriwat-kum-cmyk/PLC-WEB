-- ====================================================================
-- ALARM & MAINTENANCE MANAGEMENT SYSTEM - INDUSTRIAL SEED DATA
-- Course: Programming in Automation Systems
-- ====================================================================

-- 1. Insert Initial Machines
INSERT INTO machines (id, machine_id, name, type, location, status, description, installed_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'CNC-01', '5-Axis CNC Milling Center', 'CNC', 'Line 1 - Machining', 'Running', 'High precision titanium aerospace components machining center', '2023-01-15'),
    ('a2222222-2222-2222-2222-222222222222', 'ROB-02', 'KUKA KR-210 Robotic Welder', 'Robotic Arm', 'Line 1 - Welding', 'Running', 'Heavy-duty 6-axis automotive chassis robotic spot welding cell', '2023-04-10'),
    ('a3333333-3333-3333-3333-333333333333', 'PLC-03', 'Mitsubishi MELSEC iQ-R Main Conveyor', 'PLC Conveyor', 'Line 2 - Assembly', 'Alarm', 'Central high-speed sorting and transfer conveyor system', '2022-11-20'),
    ('a4444444-4444-4444-4444-444444444444', 'SMT-04', 'Panasonic NPM-D3 Chip Mounter', 'SMT Placement', 'Cleanroom A', 'Maintenance', 'Ultra-high-speed PCB surface mount technology placement machine', '2023-08-05'),
    ('a5555555-5555-5555-5555-555555555555', 'PKG-05', 'Omron Robotic Palletizer Unit', 'Packaging', 'Warehouse Bay 3', 'Stop', 'Automated end-of-line palletizing and stretch wrapping machine', '2022-09-12'),
    ('a6666666-6666-6666-6666-666666666666', 'INJ-06', 'Engel e-motion 310T Molding Press', 'Molding', 'Line 3 - Plastics', 'Running', 'All-electric cleanroom medical device plastic injection molding press', '2023-06-18')
ON CONFLICT (machine_id) DO NOTHING;

-- 2. Insert Industrial Alarms
INSERT INTO alarms (id, machine_id, alarm_code, description, severity, status, cause, resolution, triggered_at, resolved_at)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111',
        'a3333333-3333-3333-3333-333333333333',
        'ERR-204',
        'Inverter Drive VFD Overheat Warning',
        'High',
        'Open',
        'Cooling fan filter blocked by factory dust causing thermal trip',
        NULL,
        NOW() - INTERVAL '45 minutes',
        NULL
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'a4444444-4444-4444-4444-444444444444',
        'ERR-105',
        'Vacuum Nozzle Pressure Low (< -70 kPa)',
        'Medium',
        'In Progress',
        'Vacuum generator orifice clogged by flux residue',
        'Ultrasonic cleaning in progress',
        NOW() - INTERVAL '3 hours',
        NULL
    ),
    (
        'b3333333-3333-3333-3333-333333333333',
        'a2222222-2222-2222-2222-222222222222',
        'ERR-301',
        'Axis 4 Joint Limit Overrun & Emergency Stop',
        'Critical',
        'Closed',
        'Jig misalignment during manual workpiece loading triggered software limit switch',
        'Reset software axis limit, recalibrated mastering offset with EMT tool',
        NOW() - INTERVAL '1 day 4 hours',
        NOW() - INTERVAL '1 day 2 hours'
    ),
    (
        'b4444444-4444-4444-4444-444444444444',
        'a1111111-1111-1111-1111-111111111111',
        'WRN-012',
        'Spindle Oil Cooling Level Low Warning',
        'Low',
        'Closed',
        'Normal evaporative loss after 500 operating hours',
        'Topped up with 1.5L Mobil Vactra No. 2 spindle lubrication oil',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day 22 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Maintenance Records (including Change Request 'Waiting Part')
INSERT INTO maintenance_records (id, machine_id, maintenance_type, problem, action_taken, technician_name, status, scheduled_date, completed_date)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        'a4444444-4444-4444-4444-444444444444',
        'Preventive (PM)',
        'Bi-weekly feeder calibration, vacuum filter inspection, and linear guide re-greasing',
        'Cleaned optical alignment cameras, inspected nozzle wear',
        'Somchai Technician',
        'In Progress',
        CURRENT_DATE,
        NULL
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        'a3333333-3333-3333-3333-333333333333',
        'Breakdown (BM)',
        'Conveyor drive inverter blown IGBT module on VFD-02',
        'Diagnosed short circuit on drive output. Requisition #PO-9941 raised for replacement module.',
        'Anan Engineer',
        'Waiting Part',
        CURRENT_DATE,
        NULL
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'a1111111-1111-1111-1111-111111111111',
        'Preventive (PM)',
        'Quarterly 500-hr PM: Hydraulic oil testing, ball-screw backlash measurement, coolant filter change',
        'Changed hydraulic filter, measured 0.003mm backlash (within tolerance), tested E-stop loop',
        'Somchai Technician',
        'Completed',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE - INTERVAL '3 days'
    ),
    (
        'c4444444-4444-4444-4444-444444444444',
        'a5555555-5555-5555-5555-555555555555',
        'Corrective (CM)',
        'Safety light curtain optic beam alignment and firmware upgrade to v2.4.1',
        'Awaiting weekend plant maintenance window for firmware flash',
        'Anan Engineer',
        'Pending',
        CURRENT_DATE + INTERVAL '2 days',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Audit Logs
INSERT INTO audit_logs (id, user_name, action, entity, entity_id, details)
VALUES
    (
        gen_random_uuid(),
        'Admin System',
        'CREATE',
        'Machine',
        'CNC-01',
        '{"note": "Initial machine provisioning into factory Line 1"}'::jsonb
    ),
    (
        gen_random_uuid(),
        'Anan Engineer',
        'STATUS_CHANGE',
        'Maintenance',
        'c2222222-2222-2222-2222-222222222222',
        '{"from": "In Progress", "to": "Waiting Part", "reason": "Awaiting IGBT spare part delivery"}'::jsonb
    );
