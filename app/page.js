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

      if (!error) {
        setData(data);
      }

      setLoading(false);
    }

    loadPrayerTimes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Data tidak ditemukan</p>;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Jadwal Shalat Hari Ini</h1>
      <h3>Bekasi</h3>

      <ul>
        <li>Subuh: {data.fajr}</li>
        <li>Dzuhur: {data.dhuhr}</li>
        <li>Ashar: {data.asr}</li>
        <li>Maghrib: {data.maghrib}</li>
        <li>Isya: {data.isha}</li>
      </ul>

      <small>Update terakhir: {data.updated_at}</small>
    </main>
  );
}
