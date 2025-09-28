<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orange Frontend Development Guide</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
            /* Orange Color Palette */
            --orange-50: #fff7ed;
            --orange-100: #ffedd5;
            --orange-200: #fed7aa;
            --orange-300: #fdba74;
            --orange-400: #fb923c;
            --orange-500: #f97316;
            --orange-600: #ea580c;
            --orange-700: #c2410c;
            --orange-800: #9a3412;
            --orange-900: #7c2d12;
            --orange-950: #431407;
            
            /* Complementary Colors */
            --blue-500: #3b82f6;
            --blue-600: #2563eb;
            --teal-500: #14b8a6;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            
            /* Typography */
            --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            
            /* Spacing Scale */
            --spacing-xs: 0.25rem;
            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 1.5rem;
            --spacing-xl: 2rem;
            --spacing-2xl: 3rem;
            --spacing-3xl: 4rem;
            
            /* Border Radius */
            --radius-sm: 0.25rem;
            --radius-md: 0.5rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-primary);
            line-height: 1.6;
            color: var(--gray-800);
            background: linear-gradient(135deg, var(--orange-50) 0%, var(--gray-50) 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: var(--spacing-xl);
        }
        
        /* Typography Hierarchy */
        h1 {
            font-size: 3rem;
            font-weight: 700;
            color: var(--orange-600);
            margin-bottom: var(--spacing-xl);
            text-align: center;
            position: relative;
        }
        
        h1::after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, var(--orange-400), var(--orange-600));
            border-radius: var(--radius-sm);
        }
        
        h2 {
            font-size: 2rem;
            font-weight: 600;
            color: var(--orange-700);
            margin: var(--spacing-2xl) 0 var(--spacing-lg) 0;
            border-left: 4px solid var(--orange-500);
            padding-left: var(--spacing-md);
        }
        
        h3 {
            font-size: 1.5rem;
            font-weight: 500;
            color: var(--orange-600);
            margin: var(--spacing-xl) 0 var(--spacing-md) 0;
        }
        
        h4 {
            font-size: 1.25rem;
            font-weight: 500;
            color: var(--gray-700);
            margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
        }
        
        p {
            margin-bottom: var(--spacing-md);
            color: var(--gray-600);
        }
        
        /* Color Palette Display */
        .color-palette {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-lg);
            margin: var(--spacing-xl) 0;
        }
        
        .color-group {
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
        }
        
        .color-group h4 {
            margin-top: 0;
            margin-bottom: var(--spacing-md);
        }
        
        .color-swatch {
            display: flex;
            align-items: center;
            margin-bottom: var(--spacing-sm);
            padding: var(--spacing-sm);
            border-radius: var(--radius-sm);
            transition: all 0.2s ease;
        }
        
        .color-swatch:hover {
            transform: translateX(4px);
            box-shadow: var(--shadow-sm);
        }
        
        .color-box {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            margin-right: var(--spacing-md);
            border: 2px solid rgba(0, 0, 0, 0.1);
            flex-shrink: 0;
        }
        
        .color-info {
            flex: 1;
        }
        
        .color-name {
            font-weight: 500;
            color: var(--gray-700);
            font-size: 0.875rem;
        }
        
        .color-value {
            font-family: var(--font-mono);
            color: var(--gray-500);
            font-size: 0.75rem;
        }
        
        /* Component Showcase */
        .component-showcase {
            background: white;
            border-radius: var(--radius-xl);
            padding: var(--spacing-2xl);
            margin: var(--spacing-xl) 0;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--gray-200);
        }
        
        /* Button Styles */
        .button-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-lg);
            margin: var(--spacing-lg) 0;
        }
        
        .btn {
            padding: var(--spacing-md) var(--spacing-lg);
            border: none;
            border-radius: var(--radius-md);
            font-family: var(--font-primary);
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
        }
        
        .btn-primary {
            background: var(--orange-500);
            color: white;
            box-shadow: var(--shadow-sm);
        }
        
        .btn-primary:hover {
            background: var(--orange-600);
            box-shadow: var(--shadow-md);
            transform: translateY(-1px);
        }
        
        .btn-secondary {
            background: var(--orange-100);
            color: var(--orange-700);
            border: 1px solid var(--orange-200);
        }
        
        .btn-secondary:hover {
            background: var(--orange-200);
            border-color: var(--orange-300);
        }
        
        .btn-outline {
            background: transparent;
            color: var(--orange-600);
            border: 2px solid var(--orange-500);
        }
        
        .btn-outline:hover {
            background: var(--orange-500);
            color: white;
        }
        
        /* Form Elements */
        .form-group {
            margin-bottom: var(--spacing-lg);
        }
        
        .form-label {
            display: block;
            font-weight: 500;
            color: var(--gray-700);
            margin-bottom: var(--spacing-sm);
        }
        
        .form-input {
            width: 100%;
            padding: var(--spacing-md);
            border: 2px solid var(--gray-200);
            border-radius: var(--radius-md);
            font-family: var(--font-primary);
            transition: all 0.2s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--orange-500);
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        
        .form-select {
            width: 100%;
            padding: var(--spacing-md);
            border: 2px solid var(--gray-200);
            border-radius: var(--radius-md);
            font-family: var(--font-primary);
            background: white;
            transition: all 0.2s ease;
        }
        
        /* Card Components */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--spacing-xl);
            margin: var(--spacing-xl) 0;
        }
        
        .card {
            background: white;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }
        
        .card-header {
            padding: var(--spacing-lg);
            background: linear-gradient(135deg, var(--orange-500), var(--orange-600));
            color: white;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
        }
        
        .card-content {
            padding: var(--spacing-lg);
        }
        
        /* Alert Components */
        .alert {
            padding: var(--spacing-lg);
            border-radius: var(--radius-md);
            border-left: 4px solid;
            margin: var(--spacing-lg) 0;
        }
        
        .alert-warning {
            background: var(--orange-50);
            border-color: var(--orange-500);
            color: var(--orange-800);
        }
        
        .alert-info {
            background: var(--blue-50, #eff6ff);
            border-color: var(--blue-500);
            color: var(--blue-800, #1e40af);
        }
        
        .alert-success {
            background: var(--teal-50, #f0fdfa);
            border-color: var(--teal-500);
            color: var(--teal-800, #115e59);
        }
        
        /* Navigation */
        .nav-example {
            background: white;
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--gray-200);
            margin: var(--spacing-xl) 0;
        }
        
        .nav-links {
            display: flex;
            gap: var(--spacing-lg);
            flex-wrap: wrap;
        }
        
        .nav-link {
            color: var(--gray-600);
            text-decoration: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-sm);
            font-weight: 500;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .nav-link:hover {
            color: var(--orange-600);
            background: var(--orange-50);
        }
        
        .nav-link.active {
            color: var(--orange-600);
            background: var(--orange-100);
        }
        
        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 2px;
            background: var(--orange-500);
            border-radius: 1px;
        }
        
        /* Code Block */
        .code-block {
            background: var(--gray-900);
            color: var(--gray-100);
            padding: var(--spacing-lg);
            border-radius: var(--radius-md);
            font-family: var(--font-mono);
            font-size: 0.875rem;
            overflow-x: auto;
            margin: var(--spacing-lg) 0;
            border: 1px solid var(--gray-800);
        }
        
        .code-block .highlight {
            color: var(--orange-400);
            font-weight: 600;
        }
        
        .code-block .comment {
            color: var(--gray-400);
        }
        
        /* Guidelines Section */
        .guideline-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--spacing-xl);
            margin: var(--spacing-xl) 0;
        }
        
        .guideline-item {
            background: white;
            padding: var(--spacing-xl);
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-200);
            box-shadow: var(--shadow-sm);
        }
        
        .guideline-item h4 {
            color: var(--orange-600);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-md);
        }
        
        .icon {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }
        
        /* Usage Examples */
        .usage-example {
            background: var(--gray-50);
            padding: var(--spacing-lg);
            border-radius: var(--radius-md);
            border-left: 4px solid var(--orange-500);
            margin: var(--spacing-md) 0;
        }
        
        .usage-title {
            font-weight: 600;
            color: var(--orange-700);
            margin-bottom: var(--spacing-sm);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: var(--spacing-md);
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            .button-grid,
            .card-grid,
            .guideline-grid {
                grid-template-columns: 1fr;
            }
            
            .nav-links {
                flex-direction: column;
                gap: var(--spacing-sm);
            }
        }
        
        /* Accessibility Enhancements */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus styles */
        *:focus {
            outline: 2px solid var(--orange-500);
            outline-offset: 2px;
        }
        
        /* Animation utilities */
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧡 Orange Frontend Development Guide</h1>
        
        <section>
            <h2>🎨 Color Palette System</h2>
            <p>A comprehensive orange-based color system with semantic meanings and accessibility considerations.</p>
            
            <div class="color-palette">
                <div class="color-group">
                    <h4>Primary Orange Scale</h4>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-50);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 50</div>
                            <div class="color-value">#fff7ed</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-100);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 100</div>
                            <div class="color-value">#ffedd5</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-300);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 300</div>
                            <div class="color-value">#fdba74</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-500);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 500 (Primary)</div>
                            <div class="color-value">#f97316</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-700);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 700</div>
                            <div class="color-value">#c2410c</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--orange-900);"></div>
                        <div class="color-info">
                            <div class="color-name">Orange 900</div>
                            <div class="color-value">#7c2d12</div>
                        </div>
                    </div>
                </div>
                
                <div class="color-group">
                    <h4>Complementary Colors</h4>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--blue-500);"></div>
                        <div class="color-info">
                            <div class="color-name">Blue 500</div>
                            <div class="color-value">#3b82f6</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--teal-500);"></div>
                        <div class="color-info">
                            <div class="color-name">Teal 500</div>
                            <div class="color-value">#14b8a6</div>
                        </div>
                    </div>
                </div>
                
                <div class="color-group">
                    <h4>Neutral Grays</h4>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--gray-50);"></div>
                        <div class="color-info">
                            <div class="color-name">Gray 50</div>
                            <div class="color-value">#f9fafb</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--gray-200);"></div>
                        <div class="color-info">
                            <div class="color-name">Gray 200</div>
                            <div class="color-value">#e5e7eb</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--gray-500);"></div>
                        <div class="color-info">
                            <div class="color-name">Gray 500</div>
                            <div class="color-value">#6b7280</div>
                        </div>
                    </div>
                    <div class="color-swatch">
                        <div class="color-box" style="background: var(--gray-800);"></div>
                        <div class="color-info">
                            <div class="color-name">Gray 800</div>
                            <div class="color-value">#1f2937</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="component-showcase">
            <h2>🔘 Button Components</h2>
            <div class="button-grid">
                <button class="btn btn-primary">Primary Button</button>
                <button class="btn btn-secondary">Secondary Button</button>
                <button class="btn btn-outline">Outline Button</button>
                <a href="#" class="btn btn-primary">Link as Button</a>
            </div>
        </section>

        <section class="component-showcase">
            <h2>📝 Form Elements</h2>
            <div class="form-group">
                <label class="form-label">Input Field</label>
                <input type="text" class="form-input" placeholder="Enter your text here">
            </div>
            <div class="form-group">
                <label class="form-label">Select Dropdown</label>
                <select class="form-select">
                    <option>Choose an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                </select>
            </div>
        </section>

        <section>
            <h2>🃏 Card Components</h2>
            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Feature Card</h3>
                    </div>
                    <div class="card-content">
                        <p>This is an example of a card component with orange accent header. Perfect for showcasing features or content sections.</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Another Card</h3>
                    </div>
                    <div class="card-content">
                        <p>Cards provide a clean way to group related information and actions together in your interface design.</p>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h2>🚨 Alert Components</h2>
            <div class="alert alert-warning">
                <strong>Warning:</strong> This is an orange-themed warning alert to grab attention for important messages.
            </div>
            <div class="alert alert-info">
                <strong>Info:</strong> This is an informational alert using complementary blue color.
            </div>
            <div class="alert alert-success">
                <strong>Success:</strong> This is a success alert using complementary teal color.
            </div>
        </section>

        <section>
            <h2>🧭 Navigation Example</h2>
            <nav class="nav-example">
                <div class="nav-links">
                    <a href="#" class="nav-link active">Home</a>
                    <a href="#" class="nav-link">About</a>
                    <a href="#" class="nav-link">Services</a>
                    <a href="#" class="nav-link">Portfolio</a>
                    <a href="#" class="nav-link">Contact</a>
                </div>
            </nav>
        </section>

        <section>
            <h2>💻 CSS Variables Implementation</h2>
            <div class="code-block">
<span class="comment">/* CSS Custom Properties (Variables) */</span>
:root {
  <span class="highlight">--orange-50</span>: #fff7ed;
  <span class="highlight">--orange-500</span>: #f97316;
  <span class="highlight">--orange-600</span>: #ea580c;
  <span class="highlight">--orange-700</span>: #c2410c;
}

<span class="comment">/* Usage in components */</span>
.btn-primary {
  background: <span class="highlight">var(--orange-500)</span>;
  color: white;
}

.btn-primary:hover {
  background: <span class="highlight">var(--orange-600)</span>;
}
            </div>
        </section>

        <section>
            <h2>📐 Design Guidelines</h2>
            <div class="guideline-grid">
                <div class="guideline-item">
                    <h4>
                        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Color Usage
                    </h4>
                    <p>Use orange-500 as your primary action color. Orange-100 for subtle backgrounds. Orange-700 for text on light backgrounds.</p>
                </div>

                <div class="guideline-item">
                    <h4>
                        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Accessibility
                    </h4>
                    <p>Ensure 4.5:1 contrast ratio. Orange-600 on white backgrounds meets AA standards. Always provide focus indicators.</p>
                </div>

                <div class="guideline-item">
                    <h4>
                        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        Interactive States
                    </h4>
                    <p>Hover: Darken by one shade. Focus: Add orange outline. Active: Darken by two shades. Disabled: Use gray-300.</p>
                </div>

                <div class="guideline-item">
                    <h4>
                        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                        Spacing System
                    </h4>
                    <p>Use 8px base unit (0.5rem). Scale: 4px, 8px, 16px, 24px, 32px, 48px. Consistent spacing creates visual harmony.</p>
                </div>
            </div>
        </section>

        <section>
            <h2>🎯