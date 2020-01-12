import css from "./index.css";
import vid1 from "./videos/sinkingsmall.mp4";

const googleBlue = "#4285F4";
const googleRed = "#DB4437";
const googleGreen = "#0F9D58";
const googleYellow = "#F4B400";

const ledWidth = 640;
const ledHeight = 268;

const outScale = 2;
const skip = 5;

let vid, canvas, canvasCtx, grid, out, outCtx;

const init = () => {
  const video = document.location.search.split("=")[1];

  // Create video
  vid = document.createElement("video");
  vid.src = video || vid1;
  vid.loop = true;
  vid.muted = true;
  document.body.appendChild(vid);

  // Create canvas
  canvas = document.createElement("canvas");
  canvas.width = ledWidth;
  canvas.height = ledHeight;
  canvasCtx = canvas.getContext("2d");
  // document.body.appendChild(canvas);

  // Create grid output
  grid = document.createElement("div");
  grid.className = css.grid;
  document.body.appendChild(grid);

  out = document.createElement("canvas");
  out.width = canvas.width * outScale;
  out.height = canvas.height * outScale;
  outCtx = out.getContext("2d");
  outCtx.strokeStyle = googleBlue;
  grid.appendChild(out);

  // Listeners
  vid.addEventListener("play", draw);

  toggle.addEventListener("click", () => {
    if (vid.paused) {
      toggle.innerHTML = "Pause Video";
      vid.play();
    } else {
      toggle.innerHTML = "Play Video";
      vid.pause();
    }
  });
};

const draw = () => {
  const vratio = vid.videoHeight / vid.videoWidth;
  canvasCtx.drawImage(
    vid,
    0,
    (ledHeight - ledWidth * vratio) / 2,
    ledWidth,
    ledWidth * vratio
  );
  const frame = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const newFrame = greyscaleLuminance(frame);
  drawLines(newFrame);

  window.requestAnimationFrame(draw);
};

function drawLines(frame) {
  outCtx.clearRect(0, 0, out.width, out.height);
  outCtx.lineWidth = 1;
  outCtx.beginPath();
  for (let x = -Math.round(out.height / 10) * 10; x < out.width; x += 10) {
    outCtx.moveTo(x, 0);
    outCtx.lineTo(x + out.height, out.height);
  }
  outCtx.stroke();

  outCtx.lineWidth = 3;
  outCtx.beginPath();
  for (let x = 0; x < canvas.width; x += skip) {
    for (let y = 0; y < canvas.height; y += skip) {
      const idx = (x + y * canvas.width) * 4;
      if (frame.data[idx] < 75) {
        outCtx.moveTo(x * outScale, y * outScale);
        outCtx.lineTo(
          x * outScale + outScale * skip,
          y * outScale + outScale * skip
        );
      }
    }
  }
  outCtx.stroke();
}

document.addEventListener("DOMContentLoaded", init);

// Following code from here:
// http://ticky.github.io/canvas-dither/

// Convert image data to greyscale based on luminance.
const greyscaleLuminance = frame => {
  for (let i = 0; i <= frame.data.length; i += 4) {
    frame.data[i] = frame.data[i + 1] = frame.data[i + 2] = parseInt(
      frame.data[i] * 0.21 +
        frame.data[i + 1] * 0.71 +
        frame.data[i + 2] * 0.07,
      10
    );
  }
  return frame;
};

// Apply Atkinson Dither to Image Data
const ditherAtkinson = frame => {
  for (let curpx = 0; curpx <= frame.data.length; curpx += 4) {
    const newCol = frame.data[curpx] <= 128 ? 0 : 255;
    const err = parseInt((frame.data[curpx] - newCol) / 8, 10);
    frame.data[curpx] = newCol;
    frame.data[curpx + 4] += err;
    frame.data[curpx + 8] += err;
    frame.data[curpx + 4 * frame.width - 4] += err;
    frame.data[curpx + 4 * frame.width] += err;
    frame.data[curpx + 4 * frame.width + 4] += err;
    frame.data[curpx + 8 * frame.width] += err;
    frame.data[curpx + 1] = frame.data[curpx + 2] = frame.data[curpx];
  }
  return frame;
};
