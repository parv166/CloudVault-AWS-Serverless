const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** unitIndex;

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return DATE_FORMAT.format(date);
}

export function getTotalStorage(files) {
  return files.reduce((total, file) => total + Number(file.file_size || 0), 0);
}

export function getFileTypeLabel(fileType) {
  if (!fileType) {
    return "Unknown";
  }

  return fileType.split("/").map((part) => part.toUpperCase()).join(" / ");
}
