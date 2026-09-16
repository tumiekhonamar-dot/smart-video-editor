const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

const uploads = path.join(__dirname, "uploads");
const outputs = path.join(__dirname, "outputs");
fs.mkdirSync(uploads, { recursive: true });
fs.mkdirSync(outputs, { recursive: true });

const upload = multer({
  dest: uploads,
  limits: { fileSize: 500 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.static(__dirname));
app.use("/outputs", express.static(outputs));

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve({ stdout, stderr });
    });
  });
}

app.post("/process", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "ভিডিও পাওয়া যায়নি।" });

  const input = req.file.path;
  const outputName = `processed-${Date.now()}.mp4`;
  const output = path.join(outputs, outputName);

  // Automatic transformation for videos the user owns or is authorized to edit.
  // This does NOT remove copyright or bypass platform detection.
  const vf = [
    "scale=1280:720:force_original_aspect_ratio=decrease",
    "pad=1280:720:(ow-iw)/2:(oh-ih)/2",
    "setsar=1"
  ].join(",");

  try {
    await runFFmpeg([
      "-y",
      "-i", input,
      "-vf", vf,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      output
    ]);

    fs.unlink(input, () => {});
    res.json({
      ok: true,
      file: `/outputs/${outputName}`,
      message: "ভিডিও প্রসেস সম্পন্ন।"
    });
  } catch (e) {
    fs.unlink(input, () => {});
    res.status(500).json({ error: "ভিডিও প্রসেস করা যায়নি। Server-এ FFmpeg ইনস্টল আছে কি না দেখুন।" });
  }
});

app.listen(PORT, () => {
  console.log(`Video Transformer running on port ${PORT}`);
});
