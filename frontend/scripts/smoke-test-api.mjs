const apiUrl = (process.env.API_URL || process.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

if (!apiUrl) {
  console.error("Set API_URL or VITE_API_URL to your API Gateway endpoint.");
  process.exit(1);
}

const protectedRoutes = [
  { method: "GET", path: "/files" },
  { method: "POST", path: "/files/upload" },
  { method: "GET", path: "/files/cloudvault-auth-check/download" },
  { method: "DELETE", path: "/files/cloudvault-auth-check" },
];

async function checkUnauthenticatedAccess({ method, path }) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(method === "POST"
      ? {
          body: JSON.stringify({
            file_name: "unauthorized-test.txt",
            file_type: "text/plain",
            content_base64: "dGVzdA==",
          }),
        }
      : {}),
  });

  const body = await response.text();

  if (![401, 403].includes(response.status)) {
    throw new Error(
      `${method} ${path}: expected 401 or 403, received ${response.status}. Response: ${body}`,
    );
  }

  console.log(`${method} ${path}: correctly rejected (${response.status})`);
}

async function main() {
  console.log(`Checking protected CloudVault API routes: ${apiUrl}`);

  for (const route of protectedRoutes) {
    await checkUnauthenticatedAccess(route);
  }

  console.log("CloudVault authorization smoke test passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
