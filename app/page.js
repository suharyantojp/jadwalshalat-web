return (
  <div style={{ 
    minHeight: "100vh",
    background: "#0f172a",
    color: "#fff",
    fontFamily: "system-ui",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div style={{
      background: "#020617",
      borderRadius: "16px",
      padding: "32px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }}>
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
          <div key={label} style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            fontSize: "16px"
          }}>
            <span>{label}</span>
            <strong>{time}</strong>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: "20px",
        fontSize: "12px",
        color: "#64748b",
        textAlign: "center"
      }}>
        Update terakhir:{" "}
        {new Date(data.updated_at).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta"
        })}
      </p>
    </div>
  </div>
);
