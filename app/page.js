"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta"
  });
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta"
  });
}

function PageSection({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "24px",
            fontWeight: 700
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: "8px 0 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("kas");
  const [prayerData, setPrayerData] = useState(null);
  const [cashRows, setCashRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().slice(0, 10),
    transaction_type: "MASUK",
    category: "",
    description: "",
    amount: "",
    input_by: ""
  });

  async function loadAll() {
    setLoading(true);
    setMessage("");

    const prayerQuery = supabase
      .from("prayer_times_logs")
      .select("*")
      .eq("city", "Bekasi")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const cashQuery = supabase
      .from("mosque_cash_transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    const [{ data: prayer, error: prayerError }, { data: cash, error: cashError }] =
      await Promise.all([prayerQuery, cashQuery]);

    if (!prayerError) {
      setPrayerData(prayer);
    } else {
      setPrayerData(null);
    }

    if (!cashError && Array.isArray(cash)) {
      setCashRows(cash);
    } else {
      setCashRows([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const summary = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;

    for (const row of cashRows) {
      const amount = Number(row.amount || 0);
      if (row.transaction_type === "MASUK") totalMasuk += amount;
      if (row.transaction_type === "KELUAR") totalKeluar += amount;
    }

    return {
      totalMasuk,
      totalKeluar,
      saldo: totalMasuk - totalKeluar
    };
  }, [cashRows]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        setMessage(result.error || "Gagal menyimpan data");
        setSubmitting(false);
        return;
      }

      setMessage("Data kas berhasil disimpan");
      setForm({
        transaction_date: new Date().toISOString().slice(0, 10),
        transaction_type: "MASUK",
        category: "",
        description: "",
        amount: "",
        input_by: ""
      });

      await loadAll();
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#0f172a",
          background: "#f8fafc"
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px"
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "32px",
              fontWeight: 800
            }}
          >
            Dashboard Masjid
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              color: "#64748b",
              fontSize: "15px"
            }}
          >
            Jadwal shalat dan laporan kas masjid
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              flex: "1 1 360px",
              maxWidth: "420px"
            }}
          >
            <PageSection
              title="Jadwal Shalat"
              subtitle={prayerData ? prayerData.city : "Bekasi"}
            >
              {prayerData ? (
                <>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {[
                      ["Subuh", prayerData.fajr],
                      ["Dzuhur", prayerData.dhuhr],
                      ["Ashar", prayerData.asr],
                      ["Maghrib", prayerData.maghrib],
                      ["Isya", prayerData.isha]
                    ].map(([label, time]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff"
                        }}
                      >
                        <span
                          style={{
                            color: "#0f172a",
                            fontWeight: 500
                          }}
                        >
                          {label}
                        </span>
                        <strong
                          style={{
                            color: "#0f172a",
                            fontSize: "18px"
                          }}
                        >
                          {time}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <p
                    style={{
                      marginTop: "16px",
                      fontSize: "12px",
                      color: "#64748b",
                      textAlign: "center"
                    }}
                  >
                    Update terakhir: {formatDateTime(prayerData.created_at)}
                  </p>
                </>
              ) : (
                <p style={{ color: "#64748b" }}>Data jadwal shalat tidak ditemukan</p>
              )}
            </PageSection>
          </div>

          <div
            style={{
              flex: "2 1 720px",
              minWidth: "320px"
            }}
          >
            <PageSection title="Kas Masjid" subtitle="Monitoring pemasukan dan pengeluaran">
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px"
                }}
              >
                <button
                  onClick={() => setActiveTab("kas")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: activeTab === "kas" ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    background: activeTab === "kas" ? "#eff6ff" : "#ffffff",
                    color: activeTab === "kas" ? "#2563eb" : "#334155",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Kas Masjid
                </button>

                <button
                  onClick={() => setActiveTab("input")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: activeTab === "input" ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    background: activeTab === "input" ? "#eff6ff" : "#ffffff",
                    color: activeTab === "input" ? "#2563eb" : "#334155",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Input Kas Masjid
                </button>
              </div>

              {activeTab === "kas" ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "16px",
                      marginBottom: "24px"
                    }}
                  >
                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0"
                      }}
                    >
                      <div style={{ color: "#166534", fontSize: "13px", marginBottom: "8px" }}>
                        Total Masuk
                      </div>
                      <div style={{ color: "#166534", fontSize: "22px", fontWeight: 800 }}>
                        {formatCurrency(summary.totalMasuk)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca"
                      }}
                    >
                      <div style={{ color: "#991b1b", fontSize: "13px", marginBottom: "8px" }}>
                        Total Keluar
                      </div>
                      <div style={{ color: "#991b1b", fontSize: "22px", fontWeight: 800 }}>
                        {formatCurrency(summary.totalKeluar)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe"
                      }}
                    >
                      <div style={{ color: "#1d4ed8", fontSize: "13px", marginBottom: "8px" }}>
                        Saldo
                      </div>
                      <div style={{ color: "#1d4ed8", fontSize: "22px", fontWeight: 800 }}>
                        {formatCurrency(summary.saldo)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      overflowX: "auto",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px"
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "#ffffff"
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th style={thStyle}>Tanggal</th>
                          <th style={thStyle}>Jenis</th>
                          <th style={thStyle}>Kategori</th>
                          <th style={thStyle}>Deskripsi</th>
                          <th style={thStyle}>Nominal</th>
                          <th style={thStyle}>Input By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashRows.length > 0 ? (
                          cashRows.map((row) => (
                            <tr key={row.id}>
                              <td style={tdStyle}>{formatDate(row.transaction_date)}</td>
                              <td style={tdStyle}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    background:
                                      row.transaction_type === "MASUK" ? "#dcfce7" : "#fee2e2",
                                    color:
                                      row.transaction_type === "MASUK" ? "#166534" : "#991b1b",
                                    fontSize: "12px",
                                    fontWeight: 700
                                  }}
                                >
                                  {row.transaction_type}
                                </span>
                              </td>
                              <td style={tdStyle}>{row.category}</td>
                              <td style={tdStyle}>{row.description || "-"}</td>
                              <td style={tdStyle}>{formatCurrency(row.amount)}</td>
                              <td style={tdStyle}>{row.input_by || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td style={tdStyle} colSpan={6}>
                              Belum ada data kas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px"
                      }}
                    >
                      <Field label="Tanggal">
                        <input
                          type="date"
                          value={form.transaction_date}
                          onChange={(e) =>
                            setForm({ ...form, transaction_date: e.target.value })
                          }
                          style={inputStyle}
                          required
                        />
                      </Field>

                      <Field label="Jenis Transaksi">
                        <select
                          value={form.transaction_type}
                          onChange={(e) =>
                            setForm({ ...form, transaction_type: e.target.value })
                          }
                          style={inputStyle}
                          required
                        >
                          <option value="MASUK">MASUK</option>
                          <option value="KELUAR">KELUAR</option>
                        </select>
                      </Field>

                      <Field label="Kategori">
                        <input
                          type="text"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          style={inputStyle}
                          placeholder="Contoh: Donasi, Listrik, Sound System"
                          required
                        />
                      </Field>

                      <Field label="Nominal">
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          style={inputStyle}
                          placeholder="0"
                          required
                        />
                      </Field>

                      <Field label="Input By">
                        <input
                          type="text"
                          value={form.input_by}
                          onChange={(e) => setForm({ ...form, input_by: e.target.value })}
                          style={inputStyle}
                          placeholder="Nama petugas"
                        />
                      </Field>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <Field label="Deskripsi">
                          <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                            placeholder="Keterangan transaksi"
                          />
                        </Field>
                      </div>
                    </div>

                    <div style={{ marginTop: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "12px",
                          border: "none",
                          background: "#2563eb",
                          color: "#ffffff",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {submitting ? "Menyimpan..." : "Simpan Kas"}
                      </button>

                      {message ? (
                        <span
                          style={{
                            color: message.includes("berhasil") ? "#166534" : "#991b1b",
                            fontSize: "14px"
                          }}
                        >
                          {message}
                        </span>
                      ) : null}
                    </div>
                  </form>
                </>
              )}
            </PageSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          marginBottom: "8px",
          color: "#334155",
          fontSize: "14px",
          fontWeight: 600
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "14px",
  outline: "none"
};

const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "13px",
  color: "#475569",
  borderBottom: "1px solid #e2e8f0"
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#0f172a",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top"
};
