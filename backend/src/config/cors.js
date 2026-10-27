const localOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  "http://192.168.29.217:8080",
  "http://192.168.29.217:5173",
];

export function isAllowedOrigin(origin) {
  if (!origin) return true;

  const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if ([...configuredOrigins, ...localOrigins].includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "vercel.app" || url.hostname.endsWith(".vercel.app"))
    );
  } catch {
    return false;
  }
}
