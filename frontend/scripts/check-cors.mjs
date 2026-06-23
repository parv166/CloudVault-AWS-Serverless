const apiUrl = (process.env.API_URL || process.env.VITE_API_URL || "").replace(/\/+$/, "");
const origin = process.env.ORIGIN_URL || "http://localhost:5173";

if (!apiUrl) {
  console.error("Set API_URL or VITE_API_URL to your API Gateway endpoint.");
  process.exit(1);
}

async function checkPreflight(method) {
  const response = await fetch(`${apiUrl}/files`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": method,
      "Access-Control-Request-Headers": "content-type",
    },
  });

  const allowOrigin = response.headers.get("access-control-allow-origin");
  const allowMethods = response.headers.get("access-control-allow-methods") || "";

  if (!response.ok) {
    throw new Error(`CORS preflight for ${method} failed with ${response.status}.`);
  }

  if (allowOrigin !== "*" && allowOrigin !== origin) {
    throw new Error(`Unexpected Access-Control-Allow-Origin: ${allowOrigin || "missing"}`);
  }

  if (!allowMethods.toUpperCase().includes(method)) {
    throw new Error(`Access-Control-Allow-Methods does not include ${method}.`);
  }
}

async function main() {
  console.log(`Checking CORS for ${origin} against ${apiUrl}`);

  for (const method of ["GET", "POST", "DELETE"]) {
    await checkPreflight(method);
  }

  console.log("CloudVault CORS check passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
