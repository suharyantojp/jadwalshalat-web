export const metadata = {
  title: "Jadwal Shalat",
  description: "Jadwal shalat harian berbasis Cloudflare Workers & Supabase"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
