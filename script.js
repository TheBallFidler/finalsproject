// --- ALL CALCULATION FUNCTIONS (Updated for Verbosity) ---

function solveSystem(a11, a12, b1, a21, a22, b2) {
    const A = [[a11, a12], [a21, a22]];
    const b = [b1, b2];

    const det = a11 * a22 - a12 * a21;
    const output = {
        det: det,
        solution: null,
        cramers: null,
        gaussian: null,
        vectors: null,
        scalarLines: null
    };

    if (det === 0) {
        output.solution = "No unique solution (Determinant is 0).";
        return output;
    }

    output.cramers = calculateCramersRule(A, b, det);
    output.gaussian = calculateGaussianElimination(A, b);
    
    // Use the results from Cramer's Rule as the authoritative final solution
    const finalX = output.cramers.solution.x.toFixed(4);
    const finalY = output.cramers.solution.y.toFixed(4);
    output.solution = `x = ${finalX}, y = ${finalY}`;

    output.vectors = generateVectorPlotData(A, b, finalX, finalY);
    output.scalarLines = generateScalarLinePlotData(A, b, finalX, finalY);

    return output;
}

function calculateCramersRule(A, b, det) {
    const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
    const b1 = b[0], b2 = b[1];

    const det_x = b1 * a22 - a12 * b2;
    const det_y = a11 * b2 - b1 * a21;

    const x = det_x / det;
    const y = det_y / det;
    
    // Added explicit multiplication steps and final answers for max verbosity
    const workingText = `
        <h3>Matrix and Determinant Setup</h3>
        <p>The coefficient matrix $\\mathbf{A}$ and the constant vector $\\mathbf{b}$ are:</p>
        $$ \\mathbf{A} = \\begin{pmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{pmatrix}, \\quad \\mathbf{b} = \\begin{pmatrix} ${b1} \\\\ ${b2} \\end{pmatrix} $$
        
        <p>1. Calculate the **Determinant (D)** of $\\mathbf{A}$:</p>
        $$ D = \\begin{vmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{vmatrix} = (${a11})(${a22}) - (${a12})(${a21}) = (${a11 * a22}) - (${a12 * a21}) = ${det} $$
        
        <h3>Solving for Variables</h3>
        <p>2. Calculate $\\mathbf{D_x}$ (Replace column 1 with $\\mathbf{b}$):</p>
        $$ D_x = \\begin{vmatrix} ${b1} & ${a12} \\\\ ${b2} & ${a22} \\end{vmatrix} = (${b1})(${a22}) - (${a12})(${b2}) = (${b1 * a22}) - (${a12 * b2}) = ${det_x} $$
        
        <p>3. Calculate $\\mathbf{D_y}$ (Replace column 2 with $\\mathbf{b}$):</p>
        $$ D_y = \\begin{vmatrix} ${a11} & ${b1} \\\\ ${a21} & ${b2} \\end{vmatrix} = (${a11})(${b2}) - (${b1})(${a21}) = (${a11 * b2}) - (${b1 * a21}) = ${det_y} $$
        
        <p>4. Calculate $\\mathbf{x}$ and $\\mathbf{y}$ using the rule $x = D_x/D$ and $y = D_y/D$:</p>
        $$ x = \\frac{D_x}{D} = \\frac{${det_x}}{${det}} = ${x.toFixed(4)} $$
        $$ y = \\frac{D_y}{D} = \\frac{${det_y}}{${det}} = ${y.toFixed(4)} $$
    `;

    return { solution: { x: x, y: y }, workingText: workingText };
}

function calculateGaussianElimination(A, b) {
    let a0 = A[0][0], a1 = A[0][1], b_val0 = b[0];
    let a2 = A[1][0], a3 = A[1][1], b_val1 = b[1];
    
    // Check for trivial case before starting
    if (a0 === 0) {
        return { solution: { x: NaN, y: NaN }, workingText: `<p class="error-msg">The leading coefficient $a_{11}$ is zero. The equations must be swapped or $D=0$ applies.</p>` };
    }

    let workingText = `<h3>Augmented Matrix Setup</h3>
        <p>1. Start with the **Augmented Matrix**:</p>
        $$ \\begin{pmatrix} ${a0} & ${a1} & | & ${b_val0} \\\\ ${a2} & ${a3} & | & ${b_val1} \\end{pmatrix} $$
    `;

    // Step 2: Row reduction to Row Echelon Form
    const factor = a2 / a0;
    const R2_prime_a3 = a3 - factor * a1;
    const R2_prime_b = b_val1 - factor * b_val0;

    const factorFraction = `${a2}/${a0}`;

    workingText += `<h3>Row Reduction (Forward Elimination)</h3>
        <p>2. **Eliminate** the first term in $\\mathbf{R_2}$ (Operation: $\\mathbf{R_2} \\leftarrow \\mathbf{R_2} - \\left(\\frac{${a2}}{${a0}}\\right) \\mathbf{R_1}$):</p>
        <p>New Row 2 coefficient $a_{22}'$: $a_{3} - \\left(\\frac{${a2}}{${a0}}\\right) a_{1} = ${a3} - (${factor.toFixed(4)}) \\cdot ${a1} = ${R2_prime_a3.toFixed(4)}$</p>
        <p>New Row 2 constant $b_2'$: $b_{2} - \\left(\\frac{${a2}}{${a0}}\\right) b_{1} = ${b_val1} - (${factor.toFixed(4)}) \\cdot ${b_val0} = ${R2_prime_b.toFixed(4)}$</p>
        
        <p>Resulting Matrix (**Row Echelon Form**):</p>
        $$ \\begin{pmatrix} ${a0} & ${a1} & | & ${b_val0} \\\\ 0 & ${R2_prime_a3.toFixed(4)} & | & ${R2_prime_b.toFixed(4)} \\end{pmatrix} $$
    `;

    if (R2_prime_a3 === 0) {
         return { solution: { x: NaN, y: NaN }, workingText: workingText + `<p class="error-msg">The system has no unique solution (Infinite or No Solutions).</p>` };
    }
    
    // Step 3 & 4: Back Substitution
    const y = R2_prime_b / R2_prime_a3;
    const x_num = b_val0 - a1 * y;
    const x = x_num / a0;

    workingText += `<h3>Back Substitution</h3>
        <p>3. Solve for $\\mathbf{y}$ using the new second equation ($0x + a_{22}'y = b_2'$):</p>
        $$ ${R2_prime_a3.toFixed(4)}y = ${R2_prime_b.toFixed(4)} \\implies y = \\frac{${R2_prime_b.toFixed(4)}}{${R2_prime_a3.toFixed(4)}} = ${y.toFixed(4)} $$
        
        <p>4. Substitute $\\mathbf{y}$ back into the first equation ($a_{11}x + a_{12}y = b_1$) and solve for $\\mathbf{x}$:</p>
        $$ ${a0}x + ${a1}(${y.toFixed(4)}) = ${b_val0} $$
        $$ ${a0}x = ${b_val0} - (${a1 * y.toFixed(4)}) \\quad \\text{ (Substitution)} $$
        $$ x = \\frac{${b_val0} - (${a1 * y.toFixed(4)})}{${a0}} = \\frac{${x_num.toFixed(4)}}{${a0}} = ${x.toFixed(4)} $$
    `;

    return { solution: { x: x, y: y }, workingText: workingText };
}

function generateVectorPlotData(A, b, finalX, finalY) {
    return {
        column_vector1: { x: A[0][0], y: A[1][0] },
        column_vector2: { x: A[0][1], y: A[1][1] },
        solution_vector: { x: parseFloat(finalX), y: parseFloat(finalY) },
        constant_vector_b: { x: b[0], y: b[1] },
        linear_combination_equation: `${finalX} \\begin{pmatrix} ${A[0][0]} \\\\ ${A[1][0]} \\end{pmatrix} + ${finalY} \\begin{pmatrix} ${A[0][1]} \\\\ ${A[1][1]} \\end{pmatrix} = \\begin{pmatrix} ${b[0]} \\\\ ${b[1]} \\end{pmatrix}`
    };
}

function generateScalarLinePlotData(A, b, finalX, finalY) {
    const a11 = A[0][0], a12 = A[0][1], b1 = b[0];
    const a21 = A[1][0], a22 = A[1][1], b2 = b[1];

    return {
        line1_slope: (-a11 / a12),
        line1_intercept: (b1 / a12),
        line2_slope: (-a21 / a22),
        line2_intercept: (b2 / a22),
        intersection: { x: parseFloat(finalX), y: parseFloat(finalY) }
    };
}


// --- DYNAMIC RENDERING AND CHART INTEGRATION ---
let chartInstance = null; 

/**
 * Custom renderer for mixing HTML and LaTeX.
 */
function renderOutput(element, latexString) {
    if (typeof katex === 'undefined') {
        console.error("KaTeX library not loaded. Cannot render math.");
        element.innerHTML = latexString; 
        return;
    }
    
    const parts = latexString.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    element.innerHTML = '';

    parts.forEach(part => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const mathDiv = document.createElement('div');
            mathDiv.className = 'math-block display-math';
            try {
                katex.render(part.slice(2, -2).trim(), mathDiv, { throwOnError: true, displayMode: true });
            } catch (e) { 
                console.error("KaTeX Display Error:", e);
                mathDiv.textContent = `[MATH ERROR: ${part}]`; 
            }
            element.appendChild(mathDiv);
        } else if (part.startsWith('$') && part.endsWith('$')) {
            const mathSpan = document.createElement('span');
            mathSpan.className = 'math-block inline-math';
            try {
                katex.render(part.slice(1, -1).trim(), mathSpan, { throwOnError: true, displayMode: false });
            } catch (e) { 
                console.error("KaTeX Inline Error:", e);
                mathSpan.textContent = `[MATH ERROR: ${part}]`;
            }
            element.appendChild(mathSpan);
        } else {
            if (part.trim() !== '') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = part.trim();
                while (tempDiv.firstChild) {
                    element.appendChild(tempDiv.firstChild);
                }
            }
        }
    });
}

/**
 * Renders static math in page titles and headers on load.
 */
function renderStaticKaTeX() {
    // Wait for KaTeX to load before running this.
    if (typeof katex === 'undefined') {
        setTimeout(renderStaticKaTeX, 50); 
        return;
    }
    
    // Ensure this targets all elements that need static rendering
    document.querySelectorAll('h1, h2, h3, p, footer, .system-info').forEach(element => {
        if (element.innerHTML.includes('$')) {
            renderOutput(element, element.innerHTML);
        }
    });
}

/**
 * Renders the interactive graph on the vectors page.
 * CRITICAL FIX: Ensures Chart.js and annotation plugin are ready.
 */
function renderChart(scalarData, vectorData) {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded. Cannot render chart.");
        return;
    }
    if (typeof Chart.register === 'function' && typeof chartjs.plugin.annotation === 'undefined') {
         console.warn("Chart.js annotation plugin might not be correctly registered or loaded.");
         // Note: Assuming the user has the CDN links loaded in their HTML as requested.
    }
    
    const ctx = document.getElementById('vector-plot-chart');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const { line1_slope, line1_intercept, line2_slope, line2_intercept, intersection } = scalarData;
    const { column_vector1, column_vector2, constant_vector_b } = vectorData;
    const X_INTERSECT = intersection.x;
    const Y_INTERSECT = intersection.y;

    const allX = [0, X_INTERSECT, column_vector1.x, column_vector2.x, constant_vector_b.x];
    const allY = [0, Y_INTERSECT, column_vector1.y, column_vector2.y, constant_vector_b.y];
    
    const padding = 2;
    const minX = Math.min(...allX) - padding;
    const maxX = Math.max(...allX) + padding;
    const minY = Math.min(...allY) - padding;
    const maxY = Math.max(...allY) + padding;

    const generateLinePoints = (m, c, startX, endX) => {
        const step = (endX - startX) / 20;
        const points = [];
        for (let x = startX; x <= endX; x += step) {
            points.push({ x: x, y: m * x + c });
        }
        return points;
    };

    const scaled_v1_x = vectorData.solution_vector.x * column_vector1.x;
    const scaled_v1_y = vectorData.solution_vector.x * column_vector1.y;
    const scaled_v2_x = vectorData.solution_vector.y * column_vector2.x;
    const scaled_v2_y = vectorData.solution_vector.y * column_vector2.y;

    const annotationsArray = [];

    // Add Vector 1 (x * v1)
    if (Math.abs(vectorData.solution_vector.x) > 0.001) {
        annotationsArray.push({ type: 'line', mode: 'horizontal', xMin: 0, xMax: scaled_v1_x, yMin: 0, yMax: scaled_v1_y, borderColor: 'orange', borderWidth: 3, label: { content: 'x * v1', enabled: true, position: 'start' } });
    }
    
    // Add Vector 2 (y * v2) starting from tip of v1
    if (Math.abs(vectorData.solution_vector.y) > 0.001) {
        annotationsArray.push({ type: 'line', mode: 'horizontal', xMin: scaled_v1_x, xMax: scaled_v1_x + scaled_v2_x, yMin: scaled_v1_y, yMax: scaled_v1_y + scaled_v2_y, borderColor: 'purple', borderWidth: 3, label: { content: 'y * v2', enabled: true, position: 'start' } });
    }

    // Add Result Vector (b)
    annotationsArray.push({ type: 'line', mode: 'horizontal', xMin: 0, xMax: constant_vector_b.x, yMin: 0, yMax: constant_vector_b.y, borderColor: 'black', borderWidth: 3, borderDash: [6, 6], label: { content: 'b (Result)', enabled: true, position: 'end' } });


    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Line 1 (Row 1)',
                    data: generateLinePoints(line1_slope, line1_intercept, minX, maxX),
                    borderColor: 'rgba(255, 99, 132, 0.8)', 
                    backgroundColor: 'rgba(255, 99, 132, 0)',
                    showLine: true,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Line 2 (Row 2)',
                    data: generateLinePoints(line2_slope, line2_intercept, minX, maxX),
                    borderColor: 'rgba(54, 162, 235, 0.8)',
                    backgroundColor: 'rgba(54, 162, 235, 0)',
                    showLine: true,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: `Intersection (${X_INTERSECT.toFixed(2)}, ${Y_INTERSECT.toFixed(2)})`,
                    data: [{ x: X_INTERSECT, y: Y_INTERSECT }],
                    backgroundColor: 'rgba(40, 167, 69, 1)',
                    pointRadius: 7,
                    pointStyle: 'crossRot',
                },
            ]
        },
        options: {
            responsive: true,
            aspectRatio: 1, 
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'System Visualization (Lines and Vectors)' },
                annotation: { annotations: annotationsArray }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'X-Axis' },
                    min: minX,
                    max: maxX
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Y-Axis' },
                    min: minY,
                    max: maxY
                }
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // CRITICAL FIX 1: RENDER STATIC MATH ON LOAD (Fixes initial messy text)
    renderStaticKaTeX();

    // Check if we are on a calculator page 
    if (typeof methodId === 'undefined') return; 

    // --- Selectors ---
    const form = document.getElementById('solver-form');
    const resultsDiv = document.getElementById('results');
    const finalSolutionSpan = document.getElementById('final-solution');
    const detInfo = document.getElementById('determinant-info');
    const methodOutput = document.getElementById('method-output');
    const vectorPlotOutput = document.getElementById('vector-plot-output');
    const scalarLineOutput = document.getElementById('scalar-line-output');

    // CRITICAL FIX 2: ENSURE SUBMIT BUTTON WORKS
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Get Input Values
            const a11 = parseFloat(document.getElementById('a11').value);
            const a12 = parseFloat(document.getElementById('a12').value);
            const b1 = parseFloat(document.getElementById('b1').value);
            const a21 = parseFloat(document.getElementById('a21').value);
            const a22 = parseFloat(document.getElementById('a22').value);
            const b2 = parseFloat(document.getElementById('b2').value);

            if (isNaN(a11) || isNaN(a12) || isNaN(b1) || isNaN(a21) || isNaN(a22) || isNaN(b2)) {
                alert("Please enter a valid number for all coefficients.");
                return;
            }

            // 2. Solve System
            const result = solveSystem(a11, a12, b1, a21, a22, b2);

            // 3. Display Results
            displayResults(result);

            // 4. Render Chart (only on the vectors page, requires Chart.js)
            if (methodId === 'vectors' && result.det !== 0) {
                renderChart(result.scalarLines, result.vectors);
            }
        });
    }

    function displayResults(result) {
        resultsDiv.classList.remove('hidden');

        finalSolutionSpan.textContent = result.solution;
        renderOutput(detInfo, `Determinant $\\mathbf{D}$ of $\\mathbf{A}$: ${result.det}`);

        // Handle singular matrix / no unique solution
        if (result.det === 0) {
            if (chartInstance) chartInstance.destroy(); 
            const chartElement = document.getElementById('vector-plot-chart');
            if (chartElement) chartElement.style.display = 'none';

            if (methodOutput) renderOutput(methodOutput, `<p class="error-msg">${result.solution}</p>`);
            if (vectorPlotOutput) renderOutput(vectorPlotOutput, `<p class="error-msg">The column vectors are linearly dependent, thus the system has no unique solution.</p>`);
            if (scalarLineOutput) renderOutput(scalarLineOutput, `<p class="error-msg">The lines are parallel or coincident.</p>`);
            return;
        }

        // Show chart area if it exists
        if (methodId === 'vectors') {
             const chartElement = document.getElementById('vector-plot-chart');
             if (chartElement) chartElement.style.display = 'block';
        }

        // Display output specific to the current page 
        switch (methodId) {
            case 'cramers':
                renderOutput(methodOutput, result.cramers.workingText);
                break;
            case 'gaussian':
                renderOutput(methodOutput, result.gaussian.workingText);
                break;
            case 'vectors':
                displayVectorPlottingData(result.vectors);
                displayScalarLinePlottingData(result.scalarLines);
                break;
        }
    }

    function displayVectorPlottingData(data) {
        const html = `
            <p>The solution is a **linear combination** of the column vectors of $\\mathbf{A}$ that results in the constant vector $\\mathbf{b}$.</p>
            <p class="vector-eq-box">$$ ${data.linear_combination_equation} $$</p>
            <p>The solution is the set of **scalars** (x, y) that satisfy this combination.</p>
            
            <h4>Vector Components:</h4>
            <ul>
                <li>**Column Vector 1** ($\\vec{v_1}$): $\\begin{pmatrix} ${data.column_vector1.x} \\\\ ${data.column_vector1.y} \\end{pmatrix}$</li>
                <li>**Column Vector 2** ($\\vec{v_2}$): $\\begin{pmatrix} ${data.column_vector2.x} \\\\ ${data.column_vector2.y} \\end{pmatrix}$</li>
                <li>**Result Vector** ($\\vec{b}$): $\\begin{pmatrix} ${data.constant_vector_b.x} \\\\ ${data.constant_vector_b.y} \\end{pmatrix}$</li>
            </ul>
            <p class="plot-hint">In the chart above, **x &middot; v1** (orange) and **y &middot; v2** (purple) are added tip-to-tail to form the resultant vector **b** (black dashed).</p>
        `;
        renderOutput(vectorPlotOutput, html);
    }

    function displayScalarLinePlottingData(data) {
        const html = `
            <p>This is the traditional graphing method where the solution is the point of intersection of the two lines.</p>
            <h4>Slope-Intercept Form ($y=mx+b$):</h4>
            <ul>
                <li>**Line 1** (Red in chart): $y = (${data.line1_slope.toFixed(4)})x + ${data.line1_intercept.toFixed(4)}$</li>
                <li>**Line 2** (Blue in chart): $y = (${data.line2_slope.toFixed(4)})x + ${data.line2_intercept.toFixed(4)}$</li>
            </ul>
            <p class="final-point">The intersection point is $\\mathbf{P}: (${data.intersection.x.toFixed(4)}, ${data.intersection.y.toFixed(4)})$</p>
            <p class="plot-hint">In the chart above, the intersection of the two colored lines is marked with a **green X**.</p>
        `;
        renderOutput(scalarLineOutput, html);
    }
});
