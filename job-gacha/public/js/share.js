// 抽選結果を画像化して保存/シェアする

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildResultCanvas(entries) {
  const rowHeight = 64;
  const paddingX = 32;
  const headerHeight = 90;
  const footerHeight = 44;
  const width = 640;
  const height = headerHeight + entries.length * rowHeight + footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 背景
  ctx.fillStyle = "#fffafc";
  ctx.fillRect(0, 0, width, height);

  // ヘッダー
  ctx.fillStyle = "#ff4f8b";
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("ジョブガチャ 結果", paddingX, headerHeight / 2);

  const jobIcons = await Promise.all(
    entries.map((e) => loadImage(jobIconUrl(e.job.id)).catch(() => null))
  );

  entries.forEach((entry, i) => {
    const y = headerHeight + i * rowHeight;
    ctx.strokeStyle = "#ffe3ee";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, y);
    ctx.lineTo(width - paddingX, y);
    ctx.stroke();

    const iconSize = 40;
    const iconY = y + (rowHeight - iconSize) / 2;
    const icon = jobIcons[i];
    if (icon) {
      ctx.drawImage(icon, paddingX, iconY, iconSize, iconSize);
    }

    ctx.fillStyle = "#2b2b2b";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(entry.character.name, paddingX + iconSize + 16, y + rowHeight / 2 - 12);

    ctx.fillStyle = "#8a8a8a";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${entry.job.id} ${entry.job.nameJa}`, paddingX + iconSize + 16, y + rowHeight / 2 + 12);
  });

  ctx.fillStyle = "#8a8a8a";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("edamame.tools.pisorium.com", width - paddingX, height - footerHeight / 2);
  ctx.textAlign = "left";

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function shareDrawResult(entries) {
  const canvas = await buildResultCanvas(entries);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], "job-gacha-result.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "ジョブガチャ結果",
        text: "ジョブガチャで抽選した結果です",
      });
      return { shared: true };
    } catch (err) {
      if (err && err.name === "AbortError") return { shared: false, cancelled: true };
      // シェアに失敗した場合はダウンロードにフォールバック
    }
  }

  downloadBlob(blob, "job-gacha-result.png");
  return { shared: false, downloaded: true };
}
