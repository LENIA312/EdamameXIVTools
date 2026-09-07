// 抽選結果を画像化して保存/シェアする

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawRoundedImage(ctx, img, x, y, size, r) {
  ctx.save();
  roundedRectPath(ctx, x, y, size, size, r);
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

const ROLE_ACCENT = {
  [ROLE.TANK]: "#3d7fd1",
  [ROLE.HEALER]: "#45b26b",
  [ROLE.DPS]: "#e14c5a",
};

async function buildResultCanvas(entries) {
  const scale = 2; // 高解像度化
  const rowHeight = 76;
  const cardPaddingX = 36;
  const cardHeaderHeight = 110;
  const cardFooterHeight = 56;
  const margin = 28;
  const width = 760;
  const cardHeight = cardHeaderHeight + entries.length * rowHeight + cardFooterHeight;
  const height = cardHeight + margin * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // 背景(斜めグラデーション)
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#ffffff");
  bgGradient.addColorStop(1, "#ffe3ee");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // カード(白背景+ピンク枠、影付き)
  const cardX = margin;
  const cardY = margin;
  const cardW = width - margin * 2;

  ctx.save();
  ctx.shadowColor = "rgba(255, 79, 139, 0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundedRectPath(ctx, cardX, cardY, cardW, cardHeight, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, cardX, cardY, cardW, cardHeight, 28);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ff4f8b";
  ctx.stroke();

  // ヘッダー
  ctx.fillStyle = "#d63d73";
  ctx.font = "bold 34px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`🎲 ${t("share.headerTitle")}`, cardX + cardPaddingX, cardY + 56);

  ctx.strokeStyle = "#ffe3ee";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + cardPaddingX, cardY + cardHeaderHeight - 12);
  ctx.lineTo(cardX + cardW - cardPaddingX, cardY + cardHeaderHeight - 12);
  ctx.stroke();

  const jobIcons = await Promise.all(
    entries.map((e) => loadImage(jobIconUrl(e.job.id)).catch(() => null))
  );

  entries.forEach((entry, i) => {
    const rowY = cardY + cardHeaderHeight + i * rowHeight;
    const rowCenterY = rowY + rowHeight / 2;

    // ロールカラーのアクセントバー
    const accent = ROLE_ACCENT[entry.job.role] || "#c9c9c9";
    ctx.fillStyle = accent;
    roundedRectPath(ctx, cardX + cardPaddingX, rowY + 14, 5, rowHeight - 28, 3);
    ctx.fill();

    const iconSize = 48;
    const iconX = cardX + cardPaddingX + 20;
    const iconY = rowCenterY - iconSize / 2;
    const icon = jobIcons[i];
    if (icon) {
      drawRoundedImage(ctx, icon, iconX, iconY, iconSize, 12);
    }

    const textX = iconX + iconSize + 18;
    ctx.fillStyle = "#2b2b2b";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(entry.character.name, textX, rowCenterY - 4);

    ctx.fillStyle = "#8a8a8a";
    ctx.font = "15px sans-serif";
    ctx.fillText(jobName(entry.job), textX, rowCenterY + 20);

    if (i < entries.length - 1) {
      ctx.strokeStyle = "#fbeef4";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + cardPaddingX, rowY + rowHeight);
      ctx.lineTo(cardX + cardW - cardPaddingX, rowY + rowHeight);
      ctx.stroke();
    }
  });

  // フッター(ブランド)
  const footerY = cardY + cardHeaderHeight + entries.length * rowHeight + cardFooterHeight / 2;
  ctx.fillStyle = "#c9c9c9";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`🫛 ${t("share.footerBrand")} / edamame.tools.pisorium.com`, cardX + cardW - cardPaddingX, footerY + 4);
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
      await navigator.share({ files: [file] });
      return { shared: true };
    } catch (err) {
      if (err && err.name === "AbortError") return { shared: false, cancelled: true };
      // シェアに失敗した場合はダウンロードにフォールバック
    }
  }

  downloadBlob(blob, "job-gacha-result.png");
  return { shared: false, downloaded: true };
}
