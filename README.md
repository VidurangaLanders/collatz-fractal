# Collatz Fractal Generator

An interactive visualization tool for exploring generalized Collatz sequences and their emergent fractal patterns. This enhanced version features manual parameter input, embedded canvas preview, and real-time control adjustments.

## Features

### 🎨 Dual Canvas System
- **Embedded Canvas**: Live preview with real-time parameter adjustment
- **Full Canvas**: Immersive fullscreen experience with advanced zoom and pan controls

### 🔧 Enhanced Parameter Control
- **Slider Controls**: Quick adjustment with visual feedback
- **Manual Input**: Precise numeric input beyond slider limits
- **Live Controls**: Real-time adjustment overlay on the embedded canvas
- **Preset Configurations**: Popular fractal patterns ready to explore

### 📊 Generalized Collatz Function
The application implements the generalized Collatz function:

```
f(n) = {
    n/Y,                        if n ≡ 0 (mod Y)
    (n×(X+1) + (X-r))/Y,       otherwise
}
```

Where:
- `r = n mod X`
- `X = Z^m`
- `Z`: Base number
- `m`: Power
- `Y`: Divisor

## File Structure

```
collatz-fractal-generator/
├── index.html          # Main HTML interface
├── styles.css          # Enhanced styling with responsive design
├── main.js             # Core application logic and canvas management
├── worker.js           # Web Worker for Collatz calculations
└── README.md           # This documentation
```

## Getting Started

1. **Open the Application**
   ```bash
   # Simply open index.html in a modern web browser
   # No server required - works locally
   ```

2. **Basic Usage**
   - Adjust parameters using sliders or manual input fields
   - Click "▶ Start" to begin rendering
   - Use live controls on the embedded canvas for real-time adjustments
   - Launch full canvas for detailed exploration

3. **Advanced Controls**
   - **Zoom**: Mouse wheel or zoom buttons
   - **Pan**: Click and drag on canvas
   - **Manual Input**: Enter precise values beyond slider limits
   - **Presets**: Try popular fractal configurations

## Parameter Guide

### Core Parameters
- **Z (Base)**: Base number for the sequence (2-10000)
- **m (Power)**: Exponent applied to base (1-15)
- **Y (Divisor)**: Divisor in the Collatz function (2-10000)
- **X**: Automatically calculated as Z^m

### Sequence Control
- **Start Value**: Initial number for sequence generation (1-50000)
- **Increment**: Step size between sequences (1-20000)
- **Reset Threshold**: Maximum value before resetting sequence

### Visual Parameters
- **Angle Divisor**: Controls rotation angle (π/n) (1-2000000)
- **Line Length**: Length of each line segment (0.1-50)
- **Opacity**: Transparency of lines (0.001-1.0)
- **Background**: Color scheme selection

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop rendering |
| `C` | Clear canvas |
| `R` | Reset view (zoom/pan) |
| `S` | Save fractal as PNG |
| `Esc` | Close full canvas |

## Preset Configurations

### Classic
- Balanced parameters for traditional Collatz-style fractals
- Good starting point for exploration

### Spiral
- Creates spiral-like patterns
- Demonstrates rotational symmetry

### Popular 1 (Ramanujan-inspired)
- Z=13, m=1, Y=13, increment=1729
- Uses Ramanujan's famous number (1729)

### Popular 2 (Power of 2)
- Z=2048, m=3, Y=2048, increment=1024
- Explores high-power relationships

## Technical Features

### Performance Optimizations
- **Web Workers**: Non-blocking sequence calculations
- **Canvas Optimization**: Efficient drawing with transform caching
- **Memory Management**: Prevents infinite loops and overflow

### Browser Compatibility
- Modern browsers with Canvas 2D support
- Chrome, Firefox, Safari, Edge (latest versions)
- No external dependencies required

### Responsive Design
- Adaptive layout for different screen sizes
- Touch-friendly controls on mobile devices
- Collapsible live controls for small screens

## Mathematical Background

The generalized Collatz conjecture explores sequences where:
1. If n is divisible by Y, divide by Y
2. Otherwise, apply the transformation (n×(X+1) + (X-r))/Y

This creates complex trajectories that, when visualized as turtle graphics with rotation angles based on sequence values, produce intricate fractal patterns.

## Development Notes

### Architecture
- **Modular Design**: Separate concerns for UI, calculation, and rendering
- **Event-Driven**: Responsive to user input with immediate feedback
- **Worker-Based**: Calculations don't block the main thread

### Extensibility
- Easy to add new presets
- Configurable parameter ranges
- Pluggable rendering styles

## Troubleshooting

### Common Issues
1. **Slow Rendering**: Reduce opacity or line length for faster drawing
2. **Browser Freezing**: Lower increment value or start value
3. **Empty Canvas**: Check that parameters are within valid ranges

### Performance Tips
- Use smaller increment values for smoother animation
- Reduce opacity for overlapping patterns
- Clear canvas periodically for memory management

## Contributing

Feel free to enhance the application with:
- Additional preset configurations
- New visualization modes
- Performance optimizations
- Mathematical variants

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

---

Explore the hidden patterns in mathematics with the Collatz Fractal Generator!