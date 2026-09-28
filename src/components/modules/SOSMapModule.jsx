import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { ModuleShell, EmptyState } from "./ModuleShell";


// ----------------------------------------------------------
// DEFAULT MAP POSITION
// ----------------------------------------------------------

const SRI_LANKA_CENTER = [7.8731, 80.7718];


// ----------------------------------------------------------
// INCIDENT COLOURS
// ----------------------------------------------------------

function getIncidentColor(incident) {
  if (incident.status === "resolved") {
    return "#22c55e";
  }

  switch (incident.severity) {
    case "critical":
      return "#ff5545";

    case "medical":
      return "#38bdf8";

    case "amber":
      return "#f59e0b";

    case "info":
      return "#2dd4bf";

    default:
      return "#ff5545";
  }
}


// ----------------------------------------------------------
// CUSTOM BLINKING MARKER
// ----------------------------------------------------------

function createIncidentIcon(incident) {
  const color = getIncidentColor(incident);

  const resolvedClass =
    incident.status === "resolved" ? "resolved" : "";

  return L.divIcon({
    className: "cbmap-leaflet-icon",

    html: `
      <div
        class="cbmap-pulse-marker ${resolvedClass}"
        style="--marker-color:${color}"
      >
        <span class="cbmap-pulse cbmap-pulse-one"></span>
        <span class="cbmap-pulse cbmap-pulse-two"></span>

        <span class="cbmap-marker-center">
          <span class="cbmap-marker-dot"></span>
        </span>
      </div>
    `,

    iconSize: [42, 42],

    iconAnchor: [21, 21],

    popupAnchor: [0, -18],
  });
}


// ----------------------------------------------------------
// AUTOMATIC MAP MOVEMENT
// ----------------------------------------------------------

function MapController({
  incidents,
  selectedIncident,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedIncident?.latitude != null &&
      selectedIncident?.longitude != null
    ) {
      map.flyTo(
        [
          Number(selectedIncident.latitude),
          Number(selectedIncident.longitude),
        ],
        13,
        {
          duration: 1.3,
        }
      );

      return;
    }

    if (incidents.length === 0) {
      map.setView(SRI_LANKA_CENTER, 7);

      return;
    }

    const points = incidents.map((incident) => [
      Number(incident.latitude),
      Number(incident.longitude),
    ]);

    if (points.length === 1) {
      map.setView(points[0], 11);

      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 10,
    });
  }, [incidents, selectedIncident, map]);

  return null;
}


// ----------------------------------------------------------
// LABEL HELPER
// ----------------------------------------------------------

function severityLabel(severity) {
  switch (severity) {
    case "critical":
      return "CRITICAL";

    case "medical":
      return "MEDICAL";

    case "amber":
      return "AMBER";

    case "info":
      return "INFO";

    default:
      return "INCIDENT";
  }
}


// ----------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------

export default function SOSMapModule({
  incidents = [],
  onCreate,
  onStatus,
  busy,
}) {
  const [showForm, setShowForm] = useState(false);

  const [selectedIncidentId, setSelectedIncidentId] =
    useState(null);

  const [form, setForm] = useState({
    severity: "critical",
    category: "flood",
    title: "",
    description: "",
    latitude: "6.5854",
    longitude: "79.9607",
    locationLabel: "",
    actionLabel: "DISPATCH UNIT",
  });


  // --------------------------------------------------------
  // ONLY INCIDENTS WITH VALID GPS VALUES
  // --------------------------------------------------------

  const locatedIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const latitude = Number(incident.latitude);
      const longitude = Number(incident.longitude);

      return (
        incident.latitude != null &&
        incident.longitude != null &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    });
  }, [incidents]);


  // --------------------------------------------------------
  // CURRENT SELECTED INCIDENT
  // --------------------------------------------------------

  const selectedIncident = useMemo(() => {
    return (
      locatedIncidents.find(
        (incident) =>
          incident.id === selectedIncidentId
      ) || null
    );
  }, [
    locatedIncidents,
    selectedIncidentId,
  ]);


  // --------------------------------------------------------
  // CREATE NEW INCIDENT
  // --------------------------------------------------------

  async function submit(event) {
    event.preventDefault();

    if (!onCreate) {
      return;
    }

    await onCreate({
      ...form,

      latitude: Number(form.latitude),

      longitude: Number(form.longitude),

      tag: `${form.severity.toUpperCase()} ALERT`,
    });

    setShowForm(false);

    setForm((previous) => ({
      ...previous,

      title: "",

      description: "",

      locationLabel: "",
    }));
  }


  // --------------------------------------------------------
  // SELECT INCIDENT
  // --------------------------------------------------------

  function selectIncident(incident) {
    if (
      incident.latitude == null ||
      incident.longitude == null
    ) {
      return;
    }

    setSelectedIncidentId(incident.id);
  }


  // --------------------------------------------------------
  // COMPONENT
  // --------------------------------------------------------

  return (
    <ModuleShell
      eyebrow="GEOSPATIAL INCIDENT CONTROL"
      title="SOS Map"
      subtitle="Real-world incident map using live GPS coordinates stored in MySQL."
      actions={
        <button
          className="module-primary"
          onClick={() =>
            setShowForm((value) => !value)
          }
        >
          {showForm
            ? "CLOSE FORM"
            : "+ NEW INCIDENT"}
        </button>
      }
    >

      {/* ==================================================
          NEW INCIDENT FORM
          ================================================== */}

      {showForm && (
        <form
          className="module-form incident-form"
          onSubmit={submit}
        >

          <select
            value={form.severity}
            onChange={(event) =>
              setForm({
                ...form,
                severity: event.target.value,
              })
            }
          >
            <option value="critical">
              Critical
            </option>

            <option value="medical">
              Medical
            </option>

            <option value="amber">
              Amber
            </option>

            <option value="info">
              Info
            </option>
          </select>


          <input
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category: event.target.value,
              })
            }
            placeholder="Category"
          />


          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title: event.target.value,
              })
            }
            placeholder="Incident title"
          />


          <input
            value={form.locationLabel}
            onChange={(event) =>
              setForm({
                ...form,
                locationLabel:
                  event.target.value,
              })
            }
            placeholder="Location name"
          />


          <input
            required
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            value={form.latitude}
            onChange={(event) =>
              setForm({
                ...form,
                latitude: event.target.value,
              })
            }
            placeholder="Latitude"
          />


          <input
            required
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            value={form.longitude}
            onChange={(event) =>
              setForm({
                ...form,
                longitude: event.target.value,
              })
            }
            placeholder="Longitude"
          />


          <input
            value={form.actionLabel}
            onChange={(event) =>
              setForm({
                ...form,
                actionLabel:
                  event.target.value,
              })
            }
            placeholder="Dispatch action"
          />


          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description:
                  event.target.value,
              })
            }
            placeholder="Description"
          />


          <button
            disabled={busy}
            className="module-primary"
          >
            {busy
              ? "CREATING..."
              : "CREATE INCIDENT"}
          </button>

        </form>
      )}


      {/* ==================================================
          MAP + INCIDENT PANEL
          ================================================== */}

      <div className="cbmap-layout">

        {/* =================================================
            ACTUAL MAP
            ================================================= */}

        <section className="cbmap-panel">

          {/* Map header overlay */}

          <div className="cbmap-live-header">

            <div className="cbmap-live-left">

              <span className="cbmap-live-dot" />

              <div>

                <strong>
                  LIVE GEOSPATIAL FEED
                </strong>

                <small>
                  {locatedIncidents.length} GPS{" "}
                  incident
                  {locatedIncidents.length === 1
                    ? ""
                    : "s"}
                </small>

              </div>

            </div>


            <span className="cbmap-source">
              MYSQL / GPS
            </span>

          </div>


          {/* =================================================
              REAL OPENSTREETMAP
              NO API KEY REQUIRED
              ================================================= */}

          <MapContainer
            center={SRI_LANKA_CENTER}
            zoom={7}
            minZoom={3}
            maxZoom={18}
            scrollWheelZoom={true}
            worldCopyJump={true}
            className="cbmap-map"
          >

            {/* =================================================
                OPENSTREETMAP TILE LAYER

                This replaces the previous CARTO layer.
                No API key is required for local development.
                ================================================= */}

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />


            {/* Automatic zoom / focus */}

            <MapController
              incidents={locatedIncidents}
              selectedIncident={
                selectedIncident
              }
            />


            {/* =================================================
                INCIDENT MARKERS
                ================================================= */}

            {locatedIncidents.map(
              (incident) => {

                const latitude =
                  Number(incident.latitude);

                const longitude =
                  Number(incident.longitude);

                const color =
                  getIncidentColor(incident);


                return (
                  <React.Fragment
                    key={incident.id}
                  >

                    {/* Outer incident radius */}

                    <CircleMarker
                      center={[
                        latitude,
                        longitude,
                      ]}
                      radius={
                        selectedIncidentId ===
                        incident.id
                          ? 32
                          : 23
                      }
                      pathOptions={{
                        color,

                        fillColor: color,

                        fillOpacity:
                          selectedIncidentId ===
                          incident.id
                            ? 0.18
                            : 0.07,

                        weight: 1,
                      }}
                    />


                    {/* Blinking incident point */}

                    <Marker
                      position={[
                        latitude,
                        longitude,
                      ]}
                      icon={createIncidentIcon(
                        incident
                      )}
                      eventHandlers={{
                        click: () =>
                          selectIncident(
                            incident
                          ),
                      }}
                    >

                      <Popup>

                        <div className="cbmap-popup">

                          <div className="cbmap-popup-top">

                            <span
                              style={{
                                color,
                              }}
                            >
                              {severityLabel(
                                incident.severity
                              )}
                            </span>

                            <b>
                              {incident.code ||
                                `INC-${incident.id}`}
                            </b>

                          </div>


                          <h3>
                            {incident.title}
                          </h3>


                          {incident.desc && (
                            <p>
                              {incident.desc}
                            </p>
                          )}


                          <div className="cbmap-popup-location">

                            <small>
                              LOCATION
                            </small>

                            <strong>
                              {incident.meta ||
                                "GPS incident"}
                            </strong>

                          </div>


                          <div className="cbmap-coordinates">

                            <span>
                              LAT{" "}
                              {latitude.toFixed(
                                5
                              )}
                            </span>

                            <span>
                              LNG{" "}
                              {longitude.toFixed(
                                5
                              )}
                            </span>

                          </div>


                          <div className="cbmap-popup-status">

                            STATUS:

                            <strong>
                              {" "}
                              {(
                                incident.status ||
                                "open"
                              ).toUpperCase()}
                            </strong>

                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  </React.Fragment>
                );
              }
            )}

          </MapContainer>


          {/* Bottom overlay */}

          <div className="cbmap-bottom-bar">

            <span>
              CRISISBRIDGE GEOSPATIAL
              ENGINE
            </span>

            <span>
              WGS84 / REAL-TIME
              COORDINATES
            </span>

          </div>

        </section>


        {/* =================================================
            RIGHT-SIDE INCIDENT LIST
            ================================================= */}

        <aside className="cbmap-incidents">

          <div className="cbmap-list-heading">

            <div>

              <span>
                ACTIVE INCIDENTS
              </span>

              <h3>
                Live SOS Locations
              </h3>

            </div>


            <strong>
              {incidents.length}
            </strong>

          </div>


          {incidents.map((incident) => {

            const hasLocation =
              incident.latitude != null &&
              incident.longitude != null;

            const color =
              getIncidentColor(incident);


            return (
              <article
                key={incident.id}
                className={`cbmap-card ${
                  selectedIncidentId ===
                  incident.id
                    ? "selected"
                    : ""
                }`}
                style={{
                  "--card-color": color,
                }}
                onClick={() =>
                  selectIncident(incident)
                }
              >

                <div className="cbmap-card-accent" />


                <div className="cbmap-card-body">

                  <div className="cbmap-card-top">

                    <span>
                      {incident.code ||
                        `INC-${incident.id}`}
                    </span>

                    <b
                      style={{
                        color,
                      }}
                    >
                      {severityLabel(
                        incident.severity
                      )}
                    </b>

                  </div>


                  <h3>
                    {incident.title}
                  </h3>


                  <p>
                    {incident.meta ||
                      "Location unavailable"}
                  </p>


                  {hasLocation && (

                    <small className="cbmap-card-gps">

                      GPS:{" "}

                      {Number(
                        incident.latitude
                      ).toFixed(4)}

                      ,{" "}

                      {Number(
                        incident.longitude
                      ).toFixed(4)}

                    </small>

                  )}


                  <select
                    value={
                      incident.status ||
                      "open"
                    }
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    onChange={(event) => {

                      event.stopPropagation();

                      onStatus?.(
                        incident.id,
                        event.target.value
                      );

                    }}
                  >

                    <option value="open">
                      Open
                    </option>

                    <option value="dispatched">
                      Dispatched
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                  </select>

                </div>

              </article>
            );
          })}


          {!incidents.length && (

            <EmptyState>
              No incidents.
            </EmptyState>

          )}

        </aside>

      </div>


      {/* ==================================================
          ALL MAP CSS IS INCLUDED HERE
          ================================================== */}

      <style>{`

        .cbmap-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            300px;
          gap: 22px;
          align-items: start;
          width: 100%;
        }


        /* ===========================
           MAP CONTAINER
           =========================== */

        .cbmap-panel {
          position: relative;
          height: 680px;
          min-width: 0;
          overflow: hidden;
          border-radius: 28px;

          border:
            1px solid
            rgba(99, 130, 145, 0.28);

          background: #081019;

          box-shadow:
            0 25px 60px
            rgba(0, 0, 0, 0.32);
        }


        .cbmap-map {
          width: 100% !important;
          height: 100% !important;
          background: #081019;
          z-index: 1;
        }


        /* ==========================================
           DARK TACTICAL OPENSTREETMAP FILTER

           This converts normal OpenStreetMap tiles
           into a dark map without using an API key.
           Only map tiles are filtered.
           Markers remain their original colours.
           ========================================== */

        .cbmap-map .leaflet-tile-pane {
          filter:
            brightness(0.62)
            invert(1)
            contrast(2.1)
            hue-rotate(180deg)
            saturate(0.35)
            brightness(0.78);
        }


        /* ===========================
           TOP LIVE BAR
           =========================== */

        .cbmap-live-header {
          position: absolute;
          z-index: 500;
          top: 14px;
          left: 14px;
          right: 14px;
          min-height: 46px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 8px 12px;

          border:
            1px solid
            rgba(83, 112, 124, 0.25);

          border-radius: 14px;

          background:
            rgba(8, 13, 20, 0.88);

          backdrop-filter:
            blur(12px);

          pointer-events: none;

          box-shadow:
            0 10px 30px
            rgba(0, 0, 0, 0.3);
        }


        .cbmap-live-left {
          display: flex;
          align-items: center;
          gap: 9px;
        }


        .cbmap-live-left div {
          display: flex;
          flex-direction: column;
        }


        .cbmap-live-left strong {
          color: #31e6b3;
          font-size: 9px;
          letter-spacing: 1px;
        }


        .cbmap-live-left small {
          margin-top: 2px;
          color: #768793;
          font-size: 8px;
        }


        .cbmap-live-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #21e5ab;

          box-shadow:
            0 0 8px #21e5ab,
            0 0 18px
            rgba(33, 229, 171, 0.5);

          animation:
            cbMapLiveBlink
            1.3s infinite;
        }


        .cbmap-source {
          color: #64808c;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }


        @keyframes cbMapLiveBlink {

          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.3;
          }

        }


        /* ===========================
           BLINKING MARKERS
           =========================== */

        .cbmap-leaflet-icon {
          border: none !important;

          background:
            transparent !important;
        }


        .cbmap-pulse-marker {
          position: relative;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
        }


        .cbmap-marker-center {
          position: relative;
          z-index: 5;
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border-radius: 50%;

          background:
            var(--marker-color);

          border:
            3px solid #111820;

          box-shadow:
            0 0 12px
            var(--marker-color);
        }


        .cbmap-marker-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ffffff;
        }


        .cbmap-pulse {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 20px;
          height: 20px;

          border-radius: 50%;

          border:
            2px solid
            var(--marker-color);

          transform:
            translate(-50%, -50%)
            scale(0.6);

          opacity: 0;

          animation:
            cbMapPulse
            1.8s ease-out
            infinite;
        }


        .cbmap-pulse-two {
          animation-delay: 0.9s;
        }


        .cbmap-pulse-marker.resolved
        .cbmap-pulse {
          animation-duration: 3.5s;
        }


        @keyframes cbMapPulse {

          0% {
            transform:
              translate(-50%, -50%)
              scale(0.55);

            opacity: 0.85;
          }

          75% {
            transform:
              translate(-50%, -50%)
              scale(2.5);

            opacity: 0;
          }

          100% {
            transform:
              translate(-50%, -50%)
              scale(2.5);

            opacity: 0;
          }

        }


        /* ===========================
           LEAFLET ZOOM CONTROLS
           =========================== */

        .cbmap-map
        .leaflet-control-zoom {

          border:
            1px solid
            #303a44 !important;

          box-shadow:
            0 10px 25px
            rgba(0, 0, 0, 0.3);
        }


        .cbmap-map
        .leaflet-control-zoom a {

          color: #d6dee5;

          background: #151c25;

          border-bottom-color:
            #303943;
        }


        .cbmap-map
        .leaflet-control-zoom a:hover {

          background: #202a35;

          color: #2ce6b3;
        }


        /* ===========================
           ATTRIBUTION
           =========================== */

        .cbmap-map
        .leaflet-control-attribution {

          color: #647782;

          background:
            rgba(6, 11, 16, 0.78);

          font-size: 8px;
        }


        .cbmap-map
        .leaflet-control-attribution a {

          color: #769ba8;
        }


        /* ===========================
           MAP POPUP
           =========================== */

        .cbmap-map
        .leaflet-popup-content-wrapper {

          color: #dae1e8;

          border:
            1px solid #34404a;

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              #1a222c,
              #11171f
            );

          box-shadow:
            0 20px 50px
            rgba(0, 0, 0, 0.55);
        }


        .cbmap-map
        .leaflet-popup-tip {
          background: #151c24;
        }


        .cbmap-map
        .leaflet-popup-content {
          width: 260px !important;
          margin: 16px;
        }


        .cbmap-popup {
          font-family:
            Arial,
            sans-serif;
        }


        .cbmap-popup-top {
          display: flex;
          justify-content:
            space-between;
          gap: 15px;
          margin-bottom: 8px;
        }


        .cbmap-popup-top span {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }


        .cbmap-popup-top b {
          color: #2edfaf;
          font-size: 9px;
        }


        .cbmap-popup h3 {
          margin:
            0 0 9px;

          color: #f0f3f6;
          font-size: 15px;
          line-height: 20px;
        }


        .cbmap-popup p {
          color: #a6afb7;
          font-size: 11px;
          line-height: 16px;
        }


        .cbmap-popup-location {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 10px;
          padding: 9px 0;

          border-top:
            1px solid #2a333c;

          border-bottom:
            1px solid #2a333c;
        }


        .cbmap-popup-location small {
          color: #71818c;
          font-size: 8px;
          letter-spacing: 1px;
        }


        .cbmap-popup-location strong {
          color: #d6dee4;
          font-size: 10px;
        }


        .cbmap-coordinates {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 9px;
        }


        .cbmap-coordinates span {
          padding: 4px 6px;
          border-radius: 6px;
          color: #62d1b1;
          background: #0c131a;
          font-family: monospace;
          font-size: 8px;
        }


        .cbmap-popup-status {
          margin-top: 9px;
          color: #7c8a94;
          font-size: 9px;
        }


        .cbmap-popup-status strong {
          color: #2ce0ad;
        }


        /* ===========================
           BOTTOM MAP BAR
           =========================== */

        .cbmap-bottom-bar {
          position: absolute;
          z-index: 450;
          left: 14px;
          right: 14px;
          bottom: 14px;
          min-height: 28px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          padding: 0 10px;

          border:
            1px solid
            rgba(94, 123, 136, 0.2);

          border-radius: 8px;

          background:
            rgba(6, 11, 17, 0.84);

          backdrop-filter:
            blur(8px);

          pointer-events: none;
        }


        .cbmap-bottom-bar span {
          color: #5f7885;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }


        /* ===========================
           RIGHT PANEL
           =========================== */

        .cbmap-incidents {
          max-height: 680px;
          overflow-y: auto;
          padding-right: 4px;
        }


        .cbmap-list-heading {
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 16px;

          border:
            1px solid #29323b;

          border-radius: 16px;

          background: #151b23;
        }


        .cbmap-list-heading span {
          color: #2ce0ae;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }


        .cbmap-list-heading h3 {
          margin:
            4px 0 0;

          color: #e2e7eb;
          font-size: 15px;
        }


        .cbmap-list-heading > strong {
          display: grid;
          place-items: center;
          min-width: 35px;
          height: 35px;
          border-radius: 50%;
          color: #ff6a60;

          background:
            rgba(255, 85, 69, 0.1);

          border:
            1px solid
            rgba(255, 85, 69, 0.3);
        }


        .cbmap-card {
          position: relative;
          display: flex;
          margin-bottom: 10px;
          overflow: hidden;
          cursor: pointer;

          border:
            1px solid #29333d;

          border-radius: 16px;

          background: #171d25;

          transition:
            transform .2s ease,
            border-color .2s ease,
            background .2s ease;
        }


        .cbmap-card:hover {
          transform:
            translateX(-3px);

          border-color: #40505b;
          background: #1b232c;
        }


        .cbmap-card.selected {
          border-color:
            var(--card-color);

          background: #1b242c;
        }


        .cbmap-card-accent {
          width: 4px;
          flex-shrink: 0;

          background:
            var(--card-color);
        }


        .cbmap-card-body {
          flex: 1;
          min-width: 0;
          padding: 13px;
        }


        .cbmap-card-top {
          display: flex;
          justify-content:
            space-between;
          gap: 10px;
        }


        .cbmap-card-top span {
          color: #36ddb0;
          font-size: 8px;
          font-weight: 800;
        }


        .cbmap-card-top b {
          font-size: 7px;
          letter-spacing: 0.6px;
        }


        .cbmap-card h3 {
          margin:
            7px 0 5px;

          color: #e9edf0;
          font-size: 12px;
          line-height: 16px;
        }


        .cbmap-card p {
          margin: 0;
          color: #86949e;
          font-size: 9px;
          line-height: 14px;
        }


        .cbmap-card-gps {
          display: block;
          margin-top: 6px;
          color: #5f9a8a;
          font-family: monospace;
          font-size: 8px;
        }


        .cbmap-card select {
          width: 100%;
          margin-top: 9px;
          padding: 7px 8px;
          color: #d4dde3;

          border:
            1px solid #303b45;

          border-radius: 8px;
          outline: none;
          background: #0e151c;
          font-size: 9px;
        }


        /* ===========================
           SCROLL BAR
           =========================== */

        .cbmap-incidents::-webkit-scrollbar {
          width: 5px;
        }


        .cbmap-incidents::-webkit-scrollbar-track {
          background: transparent;
        }


        .cbmap-incidents::-webkit-scrollbar-thumb {
          border-radius: 20px;
          background: #303a44;
        }


        /* ===========================
           RESPONSIVE
           =========================== */

        @media (
          max-width: 1050px
        ) {

          .cbmap-layout {
            grid-template-columns:
              1fr;
          }

          .cbmap-incidents {
            max-height: none;

            display: grid;

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 10px;
          }

          .cbmap-list-heading {
            grid-column:
              1 / -1;

            margin-bottom: 0;
          }

          .cbmap-card {
            margin-bottom: 0;
          }

        }


        @media (
          max-width: 650px
        ) {

          .cbmap-panel {
            height: 520px;
            border-radius: 20px;
          }


          .cbmap-incidents {
            grid-template-columns:
              1fr;
          }


          .cbmap-live-header {
            right: 14px;
          }


          .cbmap-source {
            display: none;
          }


          .cbmap-bottom-bar
          span:last-child {
            display: none;
          }

        }

      `}</style>

    </ModuleShell>
  );
}