  // El mismo JavaScript de la versión anterior funciona perfectamente aquí
        document.addEventListener('DOMContentLoaded', function() {
            // Elementos del DOM
            const baseColorInput = document.getElementById('base-color');
            const schemeSelect = document.getElementById('scheme');
            const generateBtn = document.getElementById('generate-btn');
            const hexInput = document.getElementById('hex-input');
            const hexSchemeSelect = document.getElementById('hex-scheme');
            const generateHexBtn = document.getElementById('generate-hex-btn');
            const colorPalette = document.getElementById('color-palette');
            const paletteOptions = document.querySelectorAll('.palette-btn');
            const savedPalettesContainer = document.getElementById('saved-palettes');
            const toast = document.getElementById('toast');

            // Paletas por defecto
            const defaultPalettes = {
                default1: ['#FF9E9E', '#FFD1D1', '#FFE8E8', '#C4C1E0', '#7C73E6'],
                default2: ['#4361EE', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0'],
                default3: ['#2B9348', '#55A630', '#80B918', '#AACC00', '#BFD200'],
                default4: ['#FF7B00', '#FF8800', '#FF9500', '#FFA200', '#FFAA00'],
                default5: ['#FF0A54', '#FF477E', '#FF5C8A', '#FF7096', '#FF85A1']
            };

            // Paletas guardadas en localStorage
            let savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];

            // Mostrar paleta por defecto al cargar la página
            displayPalette(defaultPalettes.default1);
            displaySavedPalettes();

            // Event listeners
            generateBtn.addEventListener('click', generatePaletteFromColor);
            generateHexBtn.addEventListener('click', generatePaletteFromHex);
            paletteOptions.forEach(btn => {
                btn.addEventListener('click', () => loadDefaultPalette(btn));
            });

            // Función para generar paleta desde el selector de color
            function generatePaletteFromColor() {
                const baseColor = baseColorInput.value;
                const scheme = schemeSelect.value;
                const palette = generateColorPalette(baseColor, scheme);
                displayPalette(palette);
                savePalette(palette, `Custom Palette ${new Date().toLocaleTimeString()}`);
            }

            // Función para generar paleta desde el input HEX
            function generatePaletteFromHex() {
                const hexValue = hexInput.value;
                if (!isValidHex(hexValue)) {
                    alert('Please enter a valid HEX code (e.g. #4361ee)');
                    return;
                }
                
                const scheme = hexSchemeSelect.value;
                const palette = generateColorPalette(hexValue, scheme);
                displayPalette(palette);
                savePalette(palette, `HEX Palette ${new Date().toLocaleTimeString()}`);
            }

            // Función para cargar una paleta por defecto
            function loadDefaultPalette(btn) {
                // Remover la clase active de todos los botones
                paletteOptions.forEach(b => b.classList.remove('active'));
                // Añadir la clase active al botón clickeado
                btn.classList.add('active');
                
                const paletteName = btn.dataset.palette;
                displayPalette(defaultPalettes[paletteName]);
            }

            // Función para mostrar una paleta en el DOM
            function displayPalette(colors) {
                colorPalette.innerHTML = '';
                
                colors.forEach(color => {
                    const colorCard = document.createElement('div');
                    colorCard.className = 'color-card';
                    
                    const colorSwatch = document.createElement('div');
                    colorSwatch.className = 'color-swatch';
                    colorSwatch.style.backgroundColor = color;
                    
                    const colorInfo = document.createElement('div');
                    colorInfo.className = 'color-info';
                    
                    const colorHex = document.createElement('div');
                    colorHex.className = 'color-hex';
                    colorHex.textContent = color;
                    
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'copy-btn';
                    copyBtn.innerHTML = 'Copiar';
                    copyBtn.addEventListener('click', () => copyToClipboard(color));
                    
                    colorInfo.appendChild(colorHex);
                    colorInfo.appendChild(copyBtn);
                    colorCard.appendChild(colorSwatch);
                    colorCard.appendChild(colorInfo);
                    colorPalette.appendChild(colorCard);
                });
            }

            // Función para mostrar las paletas guardadas
            function displaySavedPalettes() {
                savedPalettesContainer.innerHTML = '';
                
                savedPalettes.forEach((palette, index) => {
                    const paletteElement = document.createElement('div');
                    paletteElement.className = 'saved-item';
                    paletteElement.addEventListener('click', () => displayPalette(palette.colors));
                    
                    const savedColors = document.createElement('div');
                    savedColors.className = 'saved-colors';
                    
                    palette.colors.slice(0, 5).forEach(color => {
                        const colorElement = document.createElement('div');
                        colorElement.className = 'saved-color';
                        colorElement.style.backgroundColor = color;
                        savedColors.appendChild(colorElement);
                    });
                    
                    const savedName = document.createElement('div');
                    savedName.className = 'saved-name';
                    savedName.textContent = palette.name;
                    
                    paletteElement.appendChild(savedColors);
                    paletteElement.appendChild(savedName);
                    savedPalettesContainer.appendChild(paletteElement);
                });
            }

            // Función para guardar una paleta
            function savePalette(colors, name) {
                // Verificar si la paleta ya existe
                const exists = savedPalettes.some(p => 
                    JSON.stringify(p.colors) === JSON.stringify(colors));
                
                if (!exists) {
                    savedPalettes.unshift({
                        name: name,
                        colors: colors
                    });
                    
                    // Limitar a 10 paletas guardadas
                    if (savedPalettes.length > 10) {
                        savedPalettes.pop();
                    }
                    
                    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
                    displaySavedPalettes();
                }
            }

            // Función para copiar al portapapeles
            function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast();
                });
            }

            // Función para mostrar el toast
            function showToast() {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            }

            // Función para validar código HEX
            function isValidHex(hex) {
                return /^#[0-9A-F]{6}$/i.test(hex);
            }

            // Función para generar una paleta de colores
            function generateColorPalette(baseColor, scheme) {
                // Convertir HEX a HSL
                const hsl = hexToHsl(baseColor);
                let colors = [];
                
                // Generar colores según el esquema seleccionado
                switch(scheme) {
                    case 'monochromatic':
                        colors = generateMonochromatic(hsl);
                        break;
                    case 'analogous':
                        colors = generateAnalogous(hsl);
                        break;
                    case 'complementary':
                        colors = generateComplementary(hsl);
                        break;
                    case 'split-complementary':
                        colors = generateSplitComplementary(hsl);
                        break;
                    case 'triadic':
                        colors = generateTriadic(hsl);
                        break;
                    case 'tetradic':
                        colors = generateTetradic(hsl);
                        break;
                    case 'square':
                        colors = generateSquare(hsl);
                        break;
                    default:
                        colors = generateMonochromatic(hsl);
                }
                
                // Convertir HSL a HEX
                return colors.map(color => hslToHex(color.h, color.s, color.l));
            }

            // Funciones para generar diferentes esquemas de color
            function generateMonochromatic(baseHsl) {
                const colors = [];
                for (let i = 0; i < 5; i++) {
                    const lightness = Math.min(95, Math.max(5, baseHsl.l + (i - 2) * 10));
                    colors.push({
                        h: baseHsl.h,
                        s: baseHsl.s,
                        l: lightness
                    });
                }
                return colors;
            }

            function generateAnalogous(baseHsl) {
                return [
                    { h: (baseHsl.h + 330) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 345) % 360, s: baseHsl.s, l: baseHsl.l },
                    baseHsl,
                    { h: (baseHsl.h + 15) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 30) % 360, s: baseHsl.s, l: baseHsl.l }
                ];
            }

            function generateComplementary(baseHsl) {
                return [
                    baseHsl,
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.min(95, baseHsl.l + 20) },
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: Math.min(95, baseHsl.l + 20) },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.max(5, baseHsl.l - 20) }
                ];
            }

            function generateSplitComplementary(baseHsl) {
                return [
                    baseHsl,
                    { h: (baseHsl.h + 150) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 210) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.min(95, baseHsl.l + 15) },
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: Math.max(5, baseHsl.l - 15) }
                ];
            }

            function generateTriadic(baseHsl) {
                return [
                    baseHsl,
                    { h: (baseHsl.h + 120) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 240) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.min(95, baseHsl.l + 20) },
                    { h: (baseHsl.h + 120) % 360, s: baseHsl.s, l: Math.max(5, baseHsl.l - 20) }
                ];
            }

            function generateTetradic(baseHsl) {
                return [
                    baseHsl,
                    { h: (baseHsl.h + 90) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 270) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.min(95, baseHsl.l + 20) }
                ];
            }

            function generateSquare(baseHsl) {
                return [
                    baseHsl,
                    { h: (baseHsl.h + 90) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: (baseHsl.h + 270) % 360, s: baseHsl.s, l: baseHsl.l },
                    { h: baseHsl.h, s: baseHsl.s, l: Math.max(5, baseHsl.l - 20) }
                ];
            }

            // Funciones de conversión de color
            function hexToHsl(hex) {
                // Convertir HEX a RGB
                let r = parseInt(hex.substring(1, 3), 16) / 255;
                let g = parseInt(hex.substring(3, 5), 16) / 255;
                let b = parseInt(hex.substring(5, 7), 16) / 255;

                // Encontrar máximo y mínimo
                let max = Math.max(r, g, b);
                let min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;

                if (max === min) {
                    h = s = 0; // achromatic
                } else {
                    let d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    
                    switch(max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    
                    h /= 6;
                }

                return {
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    l: Math.round(l * 100)
                };
            }

            function hslToHex(h, s, l) {
                h /= 360;
                s /= 100;
                l /= 100;
                
                let r, g, b;
                
                if (s === 0) {
                    r = g = b = l; // achromatic
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
                
                const toHex = x => {
                    const hex = Math.round(x * 255).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };
                
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
            }
        });