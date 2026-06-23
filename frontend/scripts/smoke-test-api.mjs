const apiUrl = (process.env.API_URL || process.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!apiUrl) {
  console.error("Set API_URL or VITE_API_URL to your API Gateway endpoint.");
  process.exit(1);
}

const testFileName = `cloudvault-smoke-${Date.now()}.txt`;
const testContent = `CloudVault smoke test ${new Date().toISOString()}`;
const contentBase64 = Buffer.from(testContent, "utf8").toString("base64");

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const rawBody = await response.text();
  let body = null;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed with ${response.status}: ${rawBody}`);
  }

  return body;
}

async function main() {
  console.log(`Testing CloudVault API: ${apiUrl}`);

  const uploadResponse = await request("/files/upload", {
    method: "POST",
    body: JSON.stringify({
      file_name: testFileName,
      file_type: "text/plain",
      content_base64: contentBase64,
    }),
  });

  const file = uploadResponse?.file;
  if (!file?.file_id) {
    throw new Error("Upload response did not include file.file_id.");
  }
  console.log(`Uploaded ${file.file_name} (${file.file_id})`);

  const listResponse = await request("/files");
  const files = Array.isArray(listResponse?.files) ? listResponse.files : [];
  if (!files.some((item) => item.file_id === file.file_id)) {
    throw new Error("Uploaded file was not returned by GET /files.");
  }
  console.log("List verified");

  const downloadResponse = await request(`/files/${encodeURIComponent(file.file_id)}/download`);
  if (!downloadResponse?.download_url) {
    throw new Error("Download response did not include download_url.");
 }

 if (!downloadResult.ok) {
    const errorBody = await downloadResult.text();

    throw new Error(
        `Pre-signed download failed with ${downloadResult.status}: ${errorBody}`
    );
 }

  const downloadedContent = await downloadResult.text();
  if (downloadedContent !== testContent) {
    throw new Error("Downloaded file content did not match uploaded content.");
  }
  console.log("Download verified");

  await request(`/files/${encodeURIComponent(file.file_id)}`, { method: "DELETE" });
  console.log("Delete verified");

  console.log("CloudVault API smoke test passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
