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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop rendering |
| `C` | Clear canvas |
| `R` | Reset view (zoom/pan) |
| `S` | Save fractal as PNG |
| `Esc` | Close full canvas |

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