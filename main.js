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
let startOffsetX = 0;
let startOffsetY = 0;
let isFullscreen = false;
let liveControlsCollapsed = false;

// Get canvas contexts
const canvas = document.getElementById('fractalCanvas');
const canvasFull = document.getElementById('fractalCanvasFull');
let ctx = canvas.getContext('2d');
let currentCanvas = canvas;

// Manual input functions
function applyManualValue(controlId) {
    const manualInput = document.getElementById(controlId + 'Manual');
    const slider = document.getElementById(controlId);
    const valueDisplay = document.getElementById(controlId + 'Val');
    
    const value = parseFloat(manualInput.value);
    
    if (isNaN(value)) {
        updateStatus('Please enter a valid number', true);
        return;
    }
    
    // Expand slider range if needed
    if (value > parseFloat(slider.max)) {
        slider.max = value * 2;
    }
    if (value < parseFloat(slider.min)) {
        slider.min = Math.min(value, parseFloat(slider.min));
    }
    
    // Apply the value
    slider.value = value;
    valueDisplay.textContent = value;
    
    // Trigger input event to ensure all synchronization happens
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Clear the manual input
    manualInput.value = '';
    
    // Update dependent values
    if (controlId === 'baseNumber' || controlId === 'power') {
        updateXValue();
    }
    
    // Sync live controls if they exist
    syncLiveControls(controlId, value);
    
    updateStatus(`${controlId} set to ${value}`, false);
}

function clearManualValue(controlId) {
    const manualInput = document.getElementById(controlId + 'Manual');
    manualInput.value = '';
    updateStatus(`Manual input cleared for ${controlId}`, false);
}

function syncLiveControls(controlId, value) {
    const liveControlMap = {
        'angleDiv': 'liveAngle',
        'lineLength': 'liveLength',
        'opacity': 'liveOpacity'
    };
    
    const liveControlId = liveControlMap[controlId];
    if (liveControlId) {
        const liveControl = document.getElementById(liveControlId);
        const liveDisplay = document.getElementById(liveControlId + 'Val');
        if (liveControl && liveDisplay) {
            // Expand live control range if needed
            if (value > parseFloat(liveControl.max)) {
                liveControl.max = value * 2;
            }
            if (value < parseFloat(liveControl.min)) {
                liveControl.min = Math.min(value, parseFloat(liveControl.min));
            }
            
            liveControl.value = value;
            liveDisplay.textContent = value;
        }
    }
}

function syncMainControls(liveControlId, value) {
    const mainControlMap = {
        'liveAngle': 'angleDiv',
        'liveLength': 'lineLength',
        'liveOpacity': 'opacity'
    };
    
    const mainControlId = mainControlMap[liveControlId];
    if (mainControlId) {
        const mainControl = document.getElementById(mainControlId);
        const mainDisplay = document.getElementById(mainControlId + 'Val');
        if (mainControl && mainDisplay) {
            // Expand main control range if needed
            if (value > parseFloat(mainControl.max)) {
                mainControl.max = value * 2;
            }
            if (value < parseFloat(mainControl.min)) {
                mainControl.min = Math.min(value, parseFloat(mainControl.min));
            }
            
            mainControl.value = value;
            mainDisplay.textContent = value;
        }
    }
}

function toggleLiveControls() {
    const liveControls = document.getElementById('liveControls');
    liveControlsCollapsed = !liveControlsCollapsed;
    
    if (liveControlsCollapsed) {
        liveControls.classList.add('collapsed');
    } else {
        liveControls.classList.remove('collapsed');
    }
}

// Enhanced mouse event handlers
function setupCanvasEvents(targetCanvas) {
    targetCanvas.addEventListener('mousedown', function(e) {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    targetCanvas.addEventListener('mousemove', function(e) {
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

    targetCanvas.addEventListener('mouseup', function() {
        isDragging = false;
    });

    targetCanvas.addEventListener('mouseleave', function() {
        isDragging = false;
    });

    targetCanvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        
        const rect = targetCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - targetCanvas.width / 2) / cameraScale - cameraX;
        const worldY = (mouseY - targetCanvas.height / 2) / cameraScale - cameraY;
        
        cameraScale *= zoomFactor;
        
        cameraX = -(worldX * zoomFactor - mouseX + targetCanvas.width / 2) / cameraScale;
        cameraY = -(worldY * zoomFactor - mouseY + targetCanvas.height / 2) / cameraScale;
        
        redrawCanvas();
    });
}

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
    const infoId = isFullscreen ? 'canvasInfoFull' : 'canvasInfo';
    const info = document.getElementById(infoId);
    const status = isDrawing ? 'Rendering' : 'Paused';
    info.textContent = `${status} • Scale: ${cameraScale.toFixed(2)}x • Position: (${Math.round(cameraX)}, ${Math.round(cameraY)})`;
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
    if (isFullscreen) {
        canvasFull.width = window.innerWidth;
        canvasFull.height = window.innerHeight;
        currentCanvas = canvasFull;
        ctx = canvasFull.getContext('2d');
    } else {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        currentCanvas = canvas;
        ctx = canvas.getContext('2d');
    }
    clearCanvas();
}

function updateStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isError ? 'status error' : 'status active';
    
    if (!isError) {
        setTimeout(() => {
            if (status.classList.contains('active')) {
                status.style.display = 'none';
            }
        }, 3000);
    }
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
    ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
    ctx.translate(currentCanvas.width / 2 + startOffsetX, currentCanvas.height * 10 / 18 + startOffsetY);
    applyCamera();
}

// Drawing control functions
function stopDrawing() {
    isDrawing = false;
    worker.terminate();
    worker = new Worker('worker.js');
    setupWorker();
    updateStatus('Drawing stopped');
    
    // Update both buttons
    const startBtn = document.getElementById('startBtn');
    const startBtnEmbedded = document.getElementById('startBtnEmbedded');
    if (startBtn) startBtn.textContent = '▶ Start';
    if (startBtnEmbedded) startBtnEmbedded.textContent = '▶ Start';
    
    updateTransformInfo();
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
    document.getElementById('xValueVal').textContent = x.toLocaleString();
}

function drawSequence(sequence) {
    const z = parseInt(document.getElementById('baseNumber').value);
    const m = parseInt(document.getElementById('power').value);
    const y = parseInt(document.getElementById('yValue').value);
    const x = Math.pow(z, m);
    
    // Get values from live controls if available, otherwise from main controls
    const angleDiv = document.getElementById('liveAngle') ? 
        parseInt(document.getElementById('liveAngle').value) : 
        parseInt(document.getElementById('angleDiv').value);
    const len = document.getElementById('liveLength') ? 
        parseInt(document.getElementById('liveLength').value) : 
        parseInt(document.getElementById('lineLength').value);
    const opacity = document.getElementById('liveOpacity') ? 
        parseFloat(document.getElementById('liveOpacity').value) : 
        parseFloat(document.getElementById('opacity').value);
    
    const angle = Math.PI / angleDiv;

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
    
    updateStatus('Drawing in progress...', false);
    
    // Update both buttons
    const startBtn = document.getElementById('startBtn');
    const startBtnEmbedded = document.getElementById('startBtnEmbedded');
    if (startBtn) startBtn.textContent = '⏸ Pause';
    if (startBtnEmbedded) startBtnEmbedded.textContent = '⏸ Pause';
    
    requestNextBatch();
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'collatz-fractal.png';
    link.href = currentCanvas.toDataURL();
    link.click();
    updateStatus('Fractal saved!', false);
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

// Canvas window management
function openRenderWindow() {
    document.getElementById('canvasWindow').style.display = 'block';
    isFullscreen = true;
    resizeCanvas();
    clearCanvas();
    updateStatus('Full canvas opened. Ready to render fractal.', false);
}

function closeRenderWindow() {
    document.getElementById('canvasWindow').style.display = 'none';
    isFullscreen = false;
    currentCanvas = canvas;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    stopDrawing();
}

// Parameter controls and value updates
function updateAllValueDisplays() {
    const controls = [
        'baseNumber', 'power', 'yValue', 'startValue', 'increment', 
        'angleDiv', 'lineLength', 'opacity'
    ];
    
    controls.forEach(id => {
        const element = document.getElementById(id);
        const display = document.getElementById(id + 'Val');
        if (element && display) {
            display.textContent = element.value;
        }
    });
    
    // Update reset value display
    const resetVal = document.getElementById('resetValue').value;
    document.getElementById('resetValueVal').textContent = resetVal;
    
    // Update live controls with current main control values
    const liveAngle = document.getElementById('liveAngle');
    const liveLength = document.getElementById('liveLength');
    const liveOpacity = document.getElementById('liveOpacity');
    
    if (liveAngle) {
        liveAngle.value = document.getElementById('angleDiv').value;
        document.getElementById('liveAngleVal').textContent = liveAngle.value;
    }
    if (liveLength) {
        liveLength.value = document.getElementById('lineLength').value;
        document.getElementById('liveLengthVal').textContent = liveLength.value;
    }
    if (liveOpacity) {
        liveOpacity.value = document.getElementById('opacity').value;
        document.getElementById('liveOpacityVal').textContent = liveOpacity.value;
    }
    
    updateXValue();
    
    // Adjust slider ranges after updating values
    adjustSliderRanges();
}

// Function to adjust slider ranges based on current values
function adjustSliderRanges() {
    const adjustments = [
        { id: 'baseNumber', min: 2, buffer: 1000 },
        { id: 'yValue', min: 2, buffer: 1000 },
        { id: 'startValue', min: 1, buffer: 2000 },
        { id: 'increment', min: 1, buffer: 1000 },
        { id: 'angleDiv', min: 8, buffer: 100000 },
        { id: 'lineLength', min: 1, buffer: 5 },
        { id: 'opacity', min: 0.01, buffer: 0.2 }
    ];

    adjustments.forEach(adj => {
        const slider = document.getElementById(adj.id);
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const currentMax = parseFloat(slider.max);
            
            // If current value is close to or exceeds max, increase the range
            if (currentValue >= currentMax * 0.9) {
                slider.max = Math.max(currentValue + adj.buffer, currentMax * 2);
            }
            
            // Ensure minimum is set correctly
            slider.min = adj.min;
        }
    });
}

// Preset configurations
function loadPreset(presetName) {
    const presets = {
        fractal1: {
            baseNumber: 2,
            power: 1,
            yValue: 2,
            startValue: 1,
            increment: 29,
            angleDiv: 96,
            lineLength: 3,
            opacity: 0.08
        },
        fractal2: {
            baseNumber: 13,
            power: 1,
            yValue: 13,
            startValue: 1,
            increment: 27,
            angleDiv: 2048,
            lineLength: 3,
            opacity: 0.15
        },
        fractal3: {
            baseNumber: 13,
            power: 1,
            yValue: 13,
            startValue: 1,
            increment: 1729,
            angleDiv: 256,
            lineLength: 5,
            opacity: 0.08
        },
        fractal4: {
            baseNumber: 256,
            power: 3,
            yValue: 256,
            startValue: 1,
            increment: 512,
            angleDiv: 63743,
            lineLength: 5,
            opacity: 0.08
        },
        fractal5: {
            baseNumber: 2048,
            power: 3,
            yValue: 2048,
            startValue: 1,
            increment: 1024,
            angleDiv: 1048576,
            lineLength: 2,
            opacity: 0.08
        }
    };

    if (presets[presetName]) {
        const preset = presets[presetName];
        
        // First, adjust slider ranges to accommodate preset values
        Object.keys(preset).forEach(key => {
            const slider = document.getElementById(key);
            if (slider) {
                const value = preset[key];
                const currentMax = parseFloat(slider.max);
                
                // Expand range if needed
                if (value > currentMax) {
                    slider.max = value * 2;
                }
            }
        });
        
        // Then set the values
        Object.keys(preset).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = preset[key];
                
                // Trigger input event to ensure all synchronization happens
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // Force update all displays and synchronizations
        updateAllValueDisplays();
        
        // Ensure live controls are properly synchronized
        syncLiveControls('angleDiv', preset.angleDiv);
        syncLiveControls('lineLength', preset.lineLength);
        syncLiveControls('opacity', preset.opacity);
        
        // Update X value
        updateXValue();
        
        updateStatus(`Loaded ${presetName} preset!`, false);
    }
}

// Event listeners setup
function setupEventListeners() {
    // Parameter sliders
    document.getElementById('baseNumber').addEventListener('input', function() {
        document.getElementById('baseNumberVal').textContent = this.value;
        updateXValue();
    });
    
    document.getElementById('power').addEventListener('input', function() {
        document.getElementById('powerVal').textContent = this.value;
        updateXValue();
    });
    
    document.getElementById('yValue').addEventListener('input', function() {
        document.getElementById('yValueVal').textContent = this.value;
    });
    
    document.getElementById('startValue').addEventListener('input', function() {
        document.getElementById('startValueVal').textContent = this.value;
    });
    
    document.getElementById('increment').addEventListener('input', function() {
        document.getElementById('incrementVal').textContent = this.value;
    });
    
    document.getElementById('angleDiv').addEventListener('input', function() {
        document.getElementById('angleDivVal').textContent = this.value;
        syncLiveControls('angleDiv', this.value);
    });
    
    document.getElementById('lineLength').addEventListener('input', function() {
        document.getElementById('lineLengthVal').textContent = this.value;
        syncLiveControls('lineLength', this.value);
    });
    
    document.getElementById('opacity').addEventListener('input', function() {
        document.getElementById('opacityVal').textContent = this.value;
        syncLiveControls('opacity', this.value);
    });

    // Live controls
    document.getElementById('liveAngle').addEventListener('input', function() {
        document.getElementById('liveAngleVal').textContent = this.value;
        syncMainControls('liveAngle', this.value);
    });
    
    document.getElementById('liveLength').addEventListener('input', function() {
        document.getElementById('liveLengthVal').textContent = this.value;
        syncMainControls('liveLength', this.value);
    });
    
    document.getElementById('liveOpacity').addEventListener('input', function() {
        document.getElementById('liveOpacityVal').textContent = this.value;
        syncMainControls('liveOpacity', this.value);
    });

    // Reset value
    document.getElementById('resetValue').addEventListener('input', function() {
        document.getElementById('resetValueVal').textContent = this.value;
    });

    // Window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                if (isFullscreen) {
                    closeRenderWindow();
                }
                break;
            case ' ':
                e.preventDefault();
                if (isDrawing) {
                    stopDrawing();
                } else {
                    startDrawing();
                }
                break;
            case 'c':
            case 'C':
                clearCanvas();
                break;
            case 'r':
            case 'R':
                resetView();
                break;
            case 's':
            case 'S':
                downloadCanvas();
                break;
        }
    });
}

// Initial setup
function initializeApp() {
    setupWorker();
    setupEventListeners();
    updateAllValueDisplays();
    
    // Setup canvas events for both canvases
    setupCanvasEvents(canvas);
    setupCanvasEvents(canvasFull);
    
    // Initial resize
    resizeCanvas();
    
    updateStatus('Collatz Fractal Generator ready!', false);
}

// Start the application
initializeApp();