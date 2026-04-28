"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrayerTimes() {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("prayer_times")
        .select("*")
        .eq("city", "Bekasi")
        .eq("prayer_date", today)
        .single();

      if (!error) setData(data);
      setLoading(false);
    }

    loadPrayerTimes();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "40px" }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "40px" }}>
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "system-ui",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          background: "#020617",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>
          Jadwal Shalat
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
          Bekasi
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {[
            ["Subuh", data.fajr],
            ["Dzuhur", data.dhuhr],
            ["Ashar", data.asr],
            ["Maghrib", data.maghrib],
            ["Isya", data.isha]
          ].map(([label, time]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "16px"
              }}
            >
              <span>{label}</span>
              <strong>{time}</strong>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#64748b",
            textAlign: "center"
          }}
        >
          Update terakhir:{" "}
          {data.updated_at
            ? new Date(data.updated_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta"
              })
            : "-"}
        </p>
      </div>
    </div>
  );
}
