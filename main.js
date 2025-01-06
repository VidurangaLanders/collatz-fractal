// Global variables
let worker = new Worker('worker.js');
let isDrawing = false;
let currentStart;
let currentReset;
let cameraScale = 1;
let cameraX = 0;
let cameraY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Get canvas context
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

// Mouse event handlers for pan and zoom
canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        cameraX += dx / cameraScale;
        cameraY += dy / cameraScale;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
});

canvas.addEventListener('mouseleave', function() {
    isDragging = false;
});

canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert mouse position to world space before zoom
    const worldX = (mouseX - canvas.width / 2) / cameraScale - cameraX;
    const worldY = (mouseY - canvas.height / 2) / cameraScale - cameraY;
    
    // Apply zoom
    cameraScale *= zoomFactor;
    
    // Adjust camera position to zoom toward mouse position
    cameraX = -(worldX * zoomFactor - mouseX + canvas.width / 2) / cameraScale;
    cameraY = -(worldY * zoomFactor - mouseY + canvas.height / 2) / cameraScale;
    
    redrawCanvas();
});

// Canvas control functions
function zoomIn() {
    cameraScale *= 1.2;
    redrawCanvas();
}

function zoomOut() {
    cameraScale *= 0.8;
    redrawCanvas();
}

function resetView() {
    cameraScale = 1;
    cameraX = 0;
    cameraY = 0;
    redrawCanvas();
}

function updateTransformInfo() {
    const info = document.getElementById('transformInfo');
    info.textContent = `Scale: ${cameraScale.toFixed(2)}x`;
}

function redrawCanvas() {
    clearCanvas(true);
    updateTransformInfo();
}

function applyCamera() {
    ctx.scale(cameraScale, cameraScale);
    ctx.translate(cameraX, cameraY);
}

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth - 40;
    canvas.height = container.clientHeight - 40;
    clearCanvas();
}

function updateStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isError ? 'status-error' : 'status-active';
}

function clearCanvas(keepTransform = false) {
    if (!keepTransform) {
        cameraScale = 1;
        cameraX = 0;
        cameraY = 0;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bgColor = document.getElementById('backgroundColor').value;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height * 10 / 18);
    applyCamera();
}

// Drawing control functions
function stopDrawing() {
    isDrawing = false;
    worker.terminate();
    worker = new Worker('worker.js');
    setupWorker();
    updateStatus('Drawing stopped');
}

function setupWorker() {
    worker.onmessage = function(e) {
        const sequence = e.data;
        drawSequence(sequence);
        
        if (isDrawing) {
            currentStart += parseInt(document.getElementById('increment').value);
            const resetThreshold = parseInt(document.getElementById('resetValue').value);
            
            if (currentStart > resetThreshold) {
                currentReset++;
                currentStart = currentReset;
            }
            
            requestNextBatch();
        }
    };

    worker.onerror = function(error) {
        updateStatus('Error in calculation: ' + error.message, true);
        stopDrawing();
    };
}

function updateXValue() {
    const z = parseInt(document.getElementById('baseNumber').value);
    const m = parseInt(document.getElementById('power').value);
    const x = Math.pow(z, m);
    document.getElementById('xValue').value = x;
}

function drawSequence(sequence) {
    const z = parseInt(document.getElementById('baseNumber').value);
    const m = parseInt(document.getElementById('power').value);
    const y = parseInt(document.getElementById('yValue').value);
    const x = Math.pow(z, m);
    const angle = Math.PI / parseInt(document.getElementById('angleDiv').value);
    const len = parseInt(document.getElementById('lineLength').value);
    const opacity = parseFloat(document.getElementById('opacity').value);

    ctx.save();
    for (let j = 0; j < sequence.length; j++) {
        let value = sequence[j];
        if ((value % y) === (y / 2)) {
            ctx.rotate(angle * (2 * ((value % y) - (y / 2)) + 1));
        } else {
            ctx.rotate(-angle * (2 * ((y / 2) - (value % y)) - 1));
        }

        const hue = j / sequence.length;
        const [r, g, b] = hslToRgb(hue, 1, 0.5);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();
        ctx.translate(0, -len);
    }
    ctx.restore();
}

function requestNextBatch() {
    const z = parseInt(document.getElementById('baseNumber').value);
    const m = parseInt(document.getElementById('power').value);
    const x = Math.pow(z, m);
    const y = parseInt(document.getElementById('yValue').value);
    
    worker.postMessage({
        start: currentStart,
        x: x,
        y: y
    });
}

function startDrawing() {
    if (isDrawing) return;
    
    clearCanvas();
    currentStart = parseInt(document.getElementById('startValue').value);
    currentReset = currentStart;
    isDrawing = true;
    ctx.lineWidth = 1;
    
    updateStatus('Drawing in progress...');
    requestNextBatch();
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'collatz-fractal.png';
    link.href = canvas.toDataURL();
    link.click();
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Event listeners
document.getElementById('baseNumber').addEventListener('input', updateXValue);
document.getElementById('power').addEventListener('input', updateXValue);
window.addEventListener('resize', resizeCanvas);

// Initial setup
setupWorker();
resizeCanvas();
updateXValue(); // Initial x value calculation