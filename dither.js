const ledWidth = 240;
const ledHeight = 80;
const circleColor = "#f9e14a";
const circleRadius = 5;
const circleSpacing = 20 - circleRadius;

let vid;
let canvas, canvasCtx;
let led, ledCtx;

const init = () => {
  // Create video
  vid = document.createElement("video");
  vid.src = "art.mp4";
  vid.loop = true;
  document.body.appendChild(vid);

  // Create canvas
  canvas = document.createElement("canvas");
  canvas.width = ledWidth;
  canvas.height = ledHeight;
  canvasCtx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  // Create led output
  led = document.createElement("canvas");
  led.width = ledWidth * (2 * circleRadius) + (ledWidth + 1) * circleSpacing;
  led.height = ledHeight * (2 * circleRadius) + (ledHeight + 1) * circleSpacing;
  document.body.appendChild(led);
  ledCtx = led.getContext("2d");

  // Listeners
  vid.addEventListener("play", draw);

  const toggle = document.getElementById("toggle");
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
  // Draw video into canvas and dither
  canvasCtx.drawImage(vid, 0, -70);
  const frame = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const newFrame = ditherAtkinson(greyscaleLuminance(frame));
  canvasCtx.putImageData(newFrame, 0, 0);

  // Draw larger led simulation
  const margin = circleSpacing + circleRadius;
  const moveAmount = 2 * circleRadius + circleSpacing;

  ledCtx.fillStyle = "black";
  ledCtx.fillRect(0, 0, led.width, led.height);
  ledCtx.translate(margin, margin);
  ledCtx.fillStyle = circleColor;
  ledCtx.strokeStyle = circleColor;
  ledCtx.lineWidth = circleRadius;
  for (let i = 0; i < ledWidth; i++) {
    for (let j = 0; j < ledHeight; j++) {
      const redIndex = i + j * newFrame.width;
      if (newFrame.data[redIndex * 4] === 255) {
        ledCtx.beginPath();
        ledCtx.moveTo(i * moveAmount - circleRadius, j * moveAmount);
        ledCtx.lineTo(i * moveAmount + circleRadius, j * moveAmount);
        ledCtx.stroke();
        ledCtx.beginPath();
        ledCtx.moveTo(i * moveAmount, j * moveAmount - circleRadius);
        ledCtx.lineTo(i * moveAmount, j * moveAmount + circleRadius);
        ledCtx.stroke();
        // ledCtx.arc(
        //   i * moveAmount,
        //   j * moveAmount,
        //   circleRadius,
        //   0,
        //   2 * Math.PI,
        //   false
        // );
        // ledCtx.fill();
      }
    }
  }
  ledCtx.translate(-margin, -margin);
  window.requestAnimationFrame(draw);
};

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
