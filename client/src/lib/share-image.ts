export function generateCveShareImage(cve: {
  cveId: string;
  score: number;
  severity: string;
  platform: string;
  vendor?: string;
  description?: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Canvas not supported")); return; }

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1200, 630);

    const grd = ctx.createLinearGradient(0, 0, 1200, 0);
    grd.addColorStop(0, "rgba(234, 88, 12, 0.08)");
    grd.addColorStop(1, "rgba(234, 88, 12, 0.02)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = "rgba(63, 63, 70, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 1152, 582);

    const sevColor = cve.severity === "CRITICAL" ? "#ef4444" :
                     cve.severity === "HIGH" ? "#f97316" :
                     cve.severity === "MEDIUM" ? "#eab308" : "#22c55e";

    ctx.fillStyle = sevColor;
    ctx.fillRect(24, 24, 6, 582);

    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.textBaseline = "top";
    ctx.fillText("VULNERABILITY ALERT", 64, 56);

    ctx.font = "bold 48px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(cve.cveId, 64, 90);

    const scoreX = 64;
    const scoreY = 160;
    ctx.beginPath();
    ctx.roundRect(scoreX, scoreY, 160, 60, 12);
    ctx.fillStyle = sevColor + "20";
    ctx.fill();
    ctx.strokeStyle = sevColor + "60";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 28px 'JetBrains Mono', monospace";
    ctx.fillStyle = sevColor;
    ctx.fillText(`CVSS ${cve.score.toFixed(1)}`, scoreX + 16, scoreY + 16);

    ctx.beginPath();
    ctx.roundRect(scoreX + 180, scoreY, cve.severity.length * 18 + 32, 60, 12);
    ctx.fillStyle = sevColor + "15";
    ctx.fill();
    ctx.font = "bold 22px 'Inter', sans-serif";
    ctx.fillStyle = sevColor;
    ctx.fillText(cve.severity, scoreX + 196, scoreY + 20);

    ctx.font = "600 24px 'Inter', sans-serif";
    ctx.fillStyle = "#f4f4f5";
    const platformText = cve.vendor ? `${cve.vendor} — ${cve.platform}` : cve.platform;
    ctx.fillText(truncateText(ctx, platformText, 1060), 64, 250);

    if (cve.description) {
      ctx.font = "400 18px 'Inter', sans-serif";
      ctx.fillStyle = "#a1a1aa";
      const lines = wrapText(ctx, cve.description, 1060, 3);
      lines.forEach((line, i) => {
        ctx.fillText(line, 64, 300 + i * 28);
      });
    }

    ctx.fillStyle = "rgba(63, 63, 70, 0.3)";
    ctx.fillRect(24, 530, 1152, 1);

    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillStyle = "#ea580c";
    ctx.fillText("STB CYBERSECURITY", 64, 555);

    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("stbcybersecurity.com", 64, 582);

    const dateText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    ctx.textAlign = "right";
    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText(dateText, 1140, 582);
    ctx.textAlign = "left";

    resolve(canvas.toDataURL("image/png"));
  });
}

export function generateRansomwareShareImage(incident: {
  victim: string;
  groupName: string;
  discoveredAt: string;
  status?: string;
  sector?: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Canvas not supported")); return; }

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1200, 630);

    const grd = ctx.createLinearGradient(0, 0, 1200, 0);
    grd.addColorStop(0, "rgba(239, 68, 68, 0.08)");
    grd.addColorStop(1, "rgba(239, 68, 68, 0.02)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = "rgba(63, 63, 70, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 1152, 582);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(24, 24, 6, 582);

    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillStyle = "#ef4444";
    ctx.textBaseline = "top";
    ctx.fillText("⚠  RANSOMWARE ALERT", 64, 56);

    ctx.font = "bold 42px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(truncateText(ctx, incident.victim, 1060), 64, 100);

    ctx.font = "400 16px 'Inter', sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("TARGETED BY", 64, 180);

    ctx.font = "bold 36px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#f97316";
    ctx.fillText(truncateText(ctx, incident.groupName, 1060), 64, 210);

    let infoY = 290;
    const drawInfoRow = (label: string, value: string) => {
      ctx.font = "600 16px 'Inter', sans-serif";
      ctx.fillStyle = "#71717a";
      ctx.fillText(label, 64, infoY);
      ctx.font = "400 18px 'Inter', sans-serif";
      ctx.fillStyle = "#d4d4d8";
      ctx.fillText(value, 220, infoY);
      infoY += 40;
    };

    drawInfoRow("DISCOVERED", new Date(incident.discoveredAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    if (incident.status) drawInfoRow("STATUS", incident.status);
    if (incident.sector) drawInfoRow("SECTOR", incident.sector);

    ctx.fillStyle = "rgba(63, 63, 70, 0.3)";
    ctx.fillRect(24, 530, 1152, 1);

    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillStyle = "#ea580c";
    ctx.fillText("STB CYBERSECURITY", 64, 555);

    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("stbcybersecurity.com", 64, 582);

    const dateText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    ctx.textAlign = "right";
    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText(dateText, 1140, 582);
    ctx.textAlign = "left";

    resolve(canvas.toDataURL("image/png"));
  });
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine) {
        if (lines.length >= maxLines - 1) {
          lines.push(truncateText(ctx, currentLine + " " + word, maxWidth));
          return lines;
        }
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, maxLines);
}
