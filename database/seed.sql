SET NAMES utf8mb4;

INSERT INTO system_metrics
(id, distress_beacons, safe_civilians, mobile_units, mesh_latency_ms, mesh_nodes, websocket_latency_ms, packet_loss, radio_band, radio_frequency, tidal_crest_seconds)
VALUES (1, 1248, 18920, 412, 3.20, 1420, 4.00, 0.000, 'BAND 14 LMR', '782.4 MHz', 5680)
ON DUPLICATE KEY UPDATE
  distress_beacons=VALUES(distress_beacons), safe_civilians=VALUES(safe_civilians), mobile_units=VALUES(mobile_units),
  mesh_latency_ms=VALUES(mesh_latency_ms), mesh_nodes=VALUES(mesh_nodes), websocket_latency_ms=VALUES(websocket_latency_ms),
  packet_loss=VALUES(packet_loss), radio_band=VALUES(radio_band), radio_frequency=VALUES(radio_frequency), tidal_crest_seconds=VALUES(tidal_crest_seconds);

INSERT INTO response_units (id, name, unit_type, readiness_percent, status, location, capacity) VALUES
(1, 'Navy SBS Rescue Battalion 04', 'Rescue', 88, 'ASSIGNED', 'Kalutara', 120),
(2, 'Red Cross First Aid Mobile Clinics', 'Medical', 94, 'DEPLOYED', 'Ratnapura', 80),
(3, 'Civil Volunteer Transport Boats', 'Transport', 62, 'CAPACITY', 'Southern Maritime Corridor', 64)
ON DUPLICATE KEY UPDATE name=VALUES(name), unit_type=VALUES(unit_type), readiness_percent=VALUES(readiness_percent), status=VALUES(status), location=VALUES(location), capacity=VALUES(capacity);

INSERT INTO incidents (id, code, severity, category, tag, title, description, sinhala_text, latitude, longitude, location_label, action_label, icon, status) VALUES
(1, 'FL-8802-A', 'critical', 'flood', 'CRITICAL RED // අතිශය හදිසි', 'ජල මට්ටම ඉහළ යමින් පවතී — Kalutara Bridge Zone B', 'Water breached second tier levee. 14 civilians awaiting boat extraction.', 'ජල මට්ටම ඉහළ යමින් පවතී.', 6.5854000, 79.9607000, 'GPS: 6.5854° N, 79.9607° E', 'DISPATCH BOAT', 'home', 'open'),
(2, 'MED-4408', 'critical', 'medical', 'CRITICAL RED // හදිසි ප්‍රතිකාර', 'Urgent: Oxygen Cylinder Depletion — Ratnapura Base Clinic', 'Oxygen reserve is below the emergency threshold. Airlift requested.', 'ඔක්සිජන් සිලින්ඩර් අවසන් වෙමින් පවතී.', 6.6828000, 80.3992000, 'GPS: 6.6828° N, 80.3992° E', 'AIRLIFT CYLINDERS', 'plus', 'open'),
(3, 'RD-2077', 'amber', 'road', 'AMBER CAUTION // අවධානයට', 'නායයාම නිසා මාර්ගය අවහිර වීම — Beruwala Mountain Access', 'Debris blocking both inbound lanes. Convoy route recalculation required.', 'නායයාම නිසා මාර්ගය අවහිර වී ඇත.', 6.4788000, 79.9828000, 'A4 Highway km 78', 'REROUTE CONVOY', 'map', 'open'),
(4, 'PWR-820', 'amber', 'power', 'AMBER CAUTION // විදුලි බිඳවැටීම', 'Substation Grid Trip — 820 Civilians In Darkness', 'Emergency floodlights deployed via mobile field generators.', 'හදිසි විදුලි බිඳවැටීමක් වාර්තා වී ඇත.', 5.9549000, 80.5550000, 'Matara Sector 3 Shelter', 'DISPATCH POWER GEN', 'pulse', 'open')
ON DUPLICATE KEY UPDATE code=VALUES(code), severity=VALUES(severity), category=VALUES(category), tag=VALUES(tag), title=VALUES(title), description=VALUES(description), sinhala_text=VALUES(sinhala_text), latitude=VALUES(latitude), longitude=VALUES(longitude), location_label=VALUES(location_label), action_label=VALUES(action_label), icon=VALUES(icon), status=VALUES(status);

INSERT INTO inventory_items (id, sku, name, category, quantity, unit, reorder_level, location, status) VALUES
(1, 'MED-O2-10L', 'Medical Oxygen Cylinder 10L', 'Medical', 36, 'cylinders', 20, 'Ratnapura Medical Store', 'ok'),
(2, 'RES-LJ-001', 'Rescue Life Jacket', 'Rescue', 148, 'units', 60, 'Galle Harbor Depot', 'ok'),
(3, 'COM-VHF-14', 'VHF Handheld Radio', 'Communications', 54, 'units', 25, 'Kalutara Command Store', 'ok'),
(4, 'PWR-GEN-5K', '5 kVA Portable Generator', 'Power', 12, 'units', 10, 'Matara Logistics Hub', 'ok'),
(5, 'MED-FAK-01', 'Trauma First Aid Kit', 'Medical', 18, 'kits', 24, 'Central Relief Warehouse', 'low'),
(6, 'WTR-PAK-20', 'Drinking Water 20L Pack', 'Relief', 320, 'packs', 100, 'Central Relief Warehouse', 'ok')
ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), quantity=VALUES(quantity), unit=VALUES(unit), reorder_level=VALUES(reorder_level), location=VALUES(location), status=VALUES(status);

INSERT INTO volunteers (id, code, full_name, phone, skills, district, status, assigned_unit) VALUES
(1, 'VOL-1001', 'Kasun Perera', '0771234567', 'First aid, radio operations', 'Kalutara', 'assigned', 'Rescue Battalion 04'),
(2, 'VOL-1002', 'Nadeesha Silva', '0712345678', 'Nursing, triage', 'Ratnapura', 'assigned', 'Red Cross Mobile Clinic'),
(3, 'VOL-1003', 'Tharindu Fernando', '0763456789', 'Boat operator, swimming', 'Galle', 'available', ''),
(4, 'VOL-1004', 'Amaya Wijesinghe', '0754567890', 'Logistics, inventory', 'Matara', 'available', '')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone), skills=VALUES(skills), district=VALUES(district), status=VALUES(status), assigned_unit=VALUES(assigned_unit);

INSERT INTO field_logs (id, unit_name, location, level, message, created_by) VALUES
(1, 'UNIT-408', 'Kalutara', 'critical', 'Water level crossed second levee marker. Boat extraction started.', NULL),
(2, 'Medical Airlift Team', 'Ratnapura', 'warning', 'Oxygen reserve below 20%. Airlift route requested.', NULL),
(3, 'Galle Harbor Patrol', 'Galle', 'info', 'Wave swell measured at 4.8m; offshore cut-off remains active.', NULL),
(4, 'Matara Shelter Team', 'Matara', 'warning', 'Generator deployed after substation grid trip.', NULL)
ON DUPLICATE KEY UPDATE unit_name=VALUES(unit_name), location=VALUES(location), level=VALUES(level), message=VALUES(message);
