# Shop360 Theme Documentation

Complete theme documentation for the Shop360 mobile app. Use this guide to recreate the same theme for your website.

---

## 🎨 Color Palette

### Light Theme

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Background | `#FFFFFF` | Main app background |
| Surface | `#F5F5F5` | Secondary surfaces (cards, modals) |
| Primary | `#000000` | Primary actions, main text |
| Secondary | `#666666` | Secondary text, inactive elements |
| Accent | `#333333` | Accent elements |
| Border | `#E0E0E0` | Borders, dividers |
| Text | `#000000` | Primary text color |
| Text Secondary | `#666666` | Secondary text color |
| Tab Bar | `#FFFFFF` | Tab bar background |
| Tab Bar Border | `#E0E0E0` | Tab bar border |
| Card | `#FFFFFF` | Card backgrounds |
| Card Border | `#E0E0E0` | Card borders |
| Icon | `#000000` | Active icons |
| Icon Inactive | `#666666` | Inactive icons |
| Tint | `#0a7ea4` | Link color, selected tab icons |
| Tab Icon Default | `#687076` | Default tab icons |
| Tab Icon Selected | `#0a7ea4` | Selected tab icons |
| Error | `#FF3B30` | Error messages, destructive actions |
| Success | `#34C759` | Success messages, positive actions |
| Overlay | `rgba(0,0,0,0.5)` | Modal overlays, backdrops |

### Dark Theme

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Background | `#000000` | Main app background |
| Surface | `#1A1A1A` | Secondary surfaces (cards, modals) |
| Primary | `#FFFFFF` | Primary actions, main text |
| Secondary | `#999999` | Secondary text, inactive elements |
| Accent | `#CCCCCC` | Accent elements |
| Border | `#333333` | Borders, dividers |
| Text | `#FFFFFF` | Primary text color |
| Text Secondary | `#999999` | Secondary text color |
| Tab Bar | `#000000` | Tab bar background |
| Tab Bar Border | `#333333` | Tab bar border |
| Card | `#1A1A1A` | Card backgrounds |
| Card Border | `#333333` | Card borders |
| Icon | `#FFFFFF` | Active icons |
| Icon Inactive | `#666666` | Inactive icons |
| Tint | `#FFFFFF` | Link color, selected tab icons |
| Tab Icon Default | `#9BA1A6` | Default tab icons |
| Tab Icon Selected | `#FFFFFF` | Selected tab icons |
| Error | `#FF3B30` | Error messages, destructive actions |
| Success | `#34C759` | Success messages, positive actions |
| Overlay | `rgba(0,0,0,0.5)` | Modal overlays, backdrops |

---

## 📝 Typography

### Font Family

The app uses system fonts:
- **iOS**: San Francisco
- **Android**: Roboto
- **Web Recommendation**: 
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  ```

### Font Styles

#### Default Text
- **Font Size**: 16px
- **Line Height**: 24px
- **Font Weight**: 400 (Regular)

#### Default Semi-Bold Text
- **Font Size**: 16px
- **Line Height**: 24px
- **Font Weight**: 600 (Semi-Bold)

#### Title
- **Font Size**: 32px
- **Line Height**: 32px
- **Font Weight**: Bold (700)

#### Subtitle
- **Font Size**: 20px
- **Font Weight**: Bold (700)

#### Link
- **Font Size**: 16px
- **Line Height**: 30px
- **Color**: `#0a7ea4` (light theme) / `#FFFFFF` (dark theme)

### Font Size Presets

The app supports accessibility font size presets:

| Preset | Multiplier | Description |
|--------|------------|-------------|
| XS | 0.85x | Extra Small |
| S | 0.93x | Small |
| M | 1.0x | Medium (default) |
| L | 1.1x | Large |
| XL | 1.22x | Extra Large |

**Note**: Apply the multiplier to base font sizes for accessibility support.

---

## 📏 Spacing System

The app uses a consistent spacing scale:

| Size | Value |
|-----|-------|
| XS | 4px |
| S | 8px |
| M | 16px |
| L | 24px |
| XL | 32px |
| XXL | 48px |

---

## 🌑 Shadows

### Small Shadow
```css
box-shadow: 0px 2px 3.84px rgba(0, 0, 0, 0.05);
```

**Properties:**
- Shadow Color: `#000000`
- Offset: `0px, 2px`
- Opacity: `0.05`
- Blur Radius: `3.84px`

### Medium Shadow
```css
box-shadow: 0px 4px 5.46px rgba(0, 0, 0, 0.1);
```

**Properties:**
- Shadow Color: `#000000`
- Offset: `0px, 4px`
- Opacity: `0.1`
- Blur Radius: `5.46px`

---

## 💻 Web Implementation Guide

### CSS Variables Approach

#### Light Theme CSS Variables
```css
:root[data-theme='light'] {
  --bg-primary: #FFFFFF;
  --bg-surface: #F5F5F5;
  --color-primary: #000000;
  --color-secondary: #666666;
  --color-accent: #333333;
  --color-border: #E0E0E0;
  --color-text: #000000;
  --color-text-secondary: #666666;
  --color-icon: #000000;
  --color-icon-inactive: #666666;
  --color-tint: #0a7ea4;
  --color-error: #FF3B30;
  --color-success: #34C759;
  --spacing-xs: 4px;
  --spacing-s: 8px;
  --spacing-m: 16px;
  --spacing-l: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}
```

#### Dark Theme CSS Variables
```css
:root[data-theme='dark'] {
  --bg-primary: #000000;
  --bg-surface: #1A1A1A;
  --color-primary: #FFFFFF;
  --color-secondary: #999999;
  --color-accent: #CCCCCC;
  --color-border: #333333;
  --color-text: #FFFFFF;
  --color-text-secondary: #999999;
  --color-icon: #FFFFFF;
  --color-icon-inactive: #666666;
  --color-tint: #FFFFFF;
  --color-error: #FF3B30;
  --color-success: #34C759;
  --spacing-xs: 4px;
  --spacing-s: 8px;
  --spacing-m: 16px;
  --spacing-l: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}
```

### Example Usage

```css
/* Background */
body {
  background-color: var(--bg-primary);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Card */
.card {
  background-color: var(--bg-surface);
  border: 1px solid var(--color-border);
  padding: var(--spacing-m);
  border-radius: 8px;
  box-shadow: 0px 2px 3.84px rgba(0, 0, 0, 0.05);
}

/* Text Styles */
.title {
  font-size: 32px;
  line-height: 32px;
  font-weight: bold;
  color: var(--color-text);
}

.subtitle {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text);
}

.body-text {
  font-size: 16px;
  line-height: 24px;
  color: var(--color-text);
}

.secondary-text {
  font-size: 16px;
  line-height: 24px;
  color: var(--color-text-secondary);
}

.link {
  font-size: 16px;
  line-height: 30px;
  color: var(--color-tint);
  text-decoration: none;
}

/* Buttons */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--bg-primary);
  padding: var(--spacing-s) var(--spacing-m);
  border-radius: 4px;
  border: none;
  font-weight: 600;
}

.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--color-text);
  padding: var(--spacing-s) var(--spacing-m);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}
```

### JavaScript Theme Toggle

```javascript
// Toggle theme
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialize on page load
loadTheme();
```

---

## 🎯 Design Principles

1. **High Contrast**: The theme uses high contrast between text and backgrounds for accessibility
2. **Minimal Color Palette**: Primarily black and white with minimal accent colors
3. **System Fonts**: Uses native system fonts for optimal performance and familiarity
4. **Consistent Spacing**: Uses a 4px base spacing scale for visual harmony
5. **Subtle Shadows**: Light shadows for depth without being overwhelming
6. **Accessibility**: Supports font size scaling for better readability

---

## 📱 Component-Specific Colors

### Tab Bar
- **Light**: White background (`#FFFFFF`) with light gray border (`#E0E0E0`)
- **Dark**: Black background (`#000000`) with dark gray border (`#333333`)

### Cards
- **Light**: White background (`#FFFFFF`) with light gray border (`#E0E0E0`)
- **Dark**: Dark gray background (`#1A1A1A`) with darker gray border (`#333333`)

### Icons
- **Active**: Primary color (black in light, white in dark)
- **Inactive**: Secondary color (gray)

---

## 🔄 Theme Transition

The app uses smooth transitions when switching themes. For web implementation, consider:

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

## 📄 Additional Resources

- See `theme-documentation.json` for a machine-readable version of this theme
- All theme values are extracted from the React Native app's theme system
- Colors are defined in `src/contexts/ThemeContext.tsx`
- Typography styles are in `src/components/ThemedText.tsx`
- Spacing and shadows are in `src/theme/index.ts`

---

**Last Updated**: 2024
**App Version**: Shop360 Mobile App

