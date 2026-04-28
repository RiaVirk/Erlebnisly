// Base email chrome shared by all transactional emails.
// Install @react-email/components, then replace with proper React Email layout.
// import { Html, Head, Body, Container } from "@react-email/components";

interface BaseLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function BaseLayout({ children, preview }: BaseLayoutProps) {
  return (
    <html>
      <head>{preview && <meta name="description" content={preview} />}</head>
      <body style={{ fontFamily: "sans-serif", background: "#f9f9f9" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", padding: 32 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
