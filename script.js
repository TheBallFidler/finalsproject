document.addEventListener('DOMContentLoaded', () => {
    // --- MAIN CALCULATION FUNCTIONS ---

    // Let the system be: a11*x + a12*y = b1 and a21*x + a22*y = b2
    function solveSystem(a11, a12, b1, a21, a22, b2) {
        const A = [[a11, a12], [a21, a22]];
        const b = [b1, b2]; // Constant vector

        const output = {
            determinant: null,
            solution: null,
            methods: {},
            scalarLinePlotData: null,
            vectorPlotData: null
        };

        const det = a11 * a22 - a12 * a21;
        output.determinant = det;

        if (det === 0) {
            output.solution = "No unique solution (Determinant is 0). The system is either inconsistent or dependent.";
            return output;
        }

        // --- 1. Cramer's Rule ---
        const cramersResult = calculateCramersRule(A, b, det);
        output.methods.cramersRule = cramersResult;

        // --- 2. Gaussian Elimination ---
        output.methods.gaussianElimination = calculateGaussianElimination(A, b);

        // --- 3. Matrix Inversion Method ---
        const matrixInversionResult = calculateMatrixInversion(A, b, det);
        output.methods.matrixInversion = matrixInversionResult;

        // Final Solution (use Cramer's as reference)
        const finalX = cramersResult.solution.x.toFixed(4);
        const finalY = cramersResult.solution.y.toFixed(4);
        output.solution = `x = ${finalX}, y = ${finalY}`;

        // --- 4. Scalar Line Equations for Plotting ---
        // For plotting the two lines (equations):
        // Line 1: a11*x + a12*y = b1 => y = (b1 - a11*x) / a12
        // Line 2: a21*x + a22*y = b2 => y = (b2 - a21*x) / a22
        output.scalarLinePlotData = {
            line1_equation_form: `${a11}x + ${a12}y = ${b1}`,
            line1_slope: (-a11 / a12).toFixed(4),
            line1_intercept: (b1 / a12).toFixed(4),
            line2_equation_form: `${a21}x + ${a22}y = ${b2}`,
            line2_slope: (-a21 / a22).toFixed(4),
            line2_intercept: (b2 / a22).toFixed(4),
            intersection: { x: finalX, y: finalY }
        };

        // --- 5. Vector Interpretation for Plotting ---
        // The system Ax=b can be seen as a linear combination of A's column vectors:
        // x * [a11, a21] + y * [a12, a22] = [b1, b2]
        output.vectorPlotData = {
            column_vector1: { x: a11, y: a21 },
            column_vector2: { x: a12, y: a22 },
            solution_vector: { x: finalX, y: finalY },
            constant_vector_b: { x: b1, y: b2 },
            linear_combination_equation: `${finalX} \\begin{pmatrix} ${a11} \\\\ ${a21} \\end{pmatrix} + ${finalY} \\begin{pmatrix} ${a12} \\\\ ${a22} \\end{pmatrix} = \\begin{pmatrix} ${b1} \\\\ ${b2} \\end{pmatrix}`
        };

        return output;
    }

    function calculateCramersRule(A, b, det) {
        const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
        const b1 = b[0], b2 = b[1];

        const det_x = b1 * a22 - a12 * b2;
        const det_y = a11 * b2 - b1 * a21;

        const x = det_x / det;
        const y = det_y / det;

        const workingText = `
            <p>1. Calculate the **Determinant (D)** of $\\mathbf{A}$:</p>
            $$ D = \\begin{vmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{vmatrix} = (${a11})(${a22}) - (${a12})(${a21}) = ${det} $$
            <p>2. Calculate $\\mathbf{D_x}$ (replace column 1 of $\\mathbf{A}$ with $\\mathbf{b}$):</p>
            $$ D_x = \\begin{vmatrix} ${b1} & ${a12} \\\\ ${b2} & ${a22} \\end{vmatrix} = (${b1})(${a22}) - (${a12})(${b2}) = ${det_x} $$
            <p>3. Calculate $\\mathbf{D_y}$ (replace column 2 of $\\mathbf{A}$ with $\\mathbf{b}$):</p>
            $$ D_y = \\begin{vmatrix} ${a11} & ${b1} \\\\ ${a21} & ${b2} \\end{vmatrix} = (${a11})(${b2}) - (${b1})(${a21}) = ${det_y} $$
            <p>4. Calculate $\\mathbf{x}$ and $\\mathbf{y}$ using Cramer's Rule:</p>
            $$ x = \\frac{D_x}{D} = \\frac{${det_x}}{${det}} = ${x.toFixed(4)} $$
            $$ y = \\frac{D_y}{D} = \\frac{${det_y}}{${det}} = ${y.toFixed(4)} $$
        `;

        return {
            solution: { x: x, y: y },
            workingText: workingText
        };
    }

    function calculateGaussianElimination(A, b) {
        let a0 = A[0][0], a1 = A[0][1], b_val0 = b[0];
        let a2 = A[1][0], a3 = A[1][1], b_val1 = b[1];
        
        let workingText = `<p>1. Start with the **Augmented Matrix**:</p>
            $$ \\begin{pmatrix} ${a0} & ${a1} & | & ${b_val0} \\\\ ${a2} & ${a3} & | & ${b_val1} \\end{pmatrix} $$
        `;

        // Make A[1][0] zero
        const factor = a2 / a0;
        const R2_prime_a3 = a3 - factor * a1;
        const R2_prime_b = b_val1 - factor * b_val0;

        const factorFraction = `${a2}/${a0}`;

        workingText += `<p>2. **Eliminate** the first term in $\\mathbf{R_2}$ using $\\mathbf{R_1}$ (Operation: $\\mathbf{R_2} \\leftarrow \\mathbf{R_2} - ${factorFraction} \\mathbf{R_1}$):</p>
            <p>New $\\mathbf{R_2}$ calculations:</p>
            <ul>
                <li>${a2} - ${factor.toFixed(4)} \\cdot ${a0} = 0</li>
                <li>${a3} - ${factor.toFixed(4)} \\cdot ${a1} = ${R2_prime_a3.toFixed(4)}</li>
                <li>${b_val1} - ${factor.toFixed(4)} \\cdot ${b_val0} = ${R2_prime_b.toFixed(4)}</li>
            </ul>
            <p>Resulting Matrix (**Row Echelon Form**):</p>
            $$ \\begin{pmatrix} ${a0} & ${a1} & | & ${b_val0} \\\\ 0 & ${R2_prime_a3.toFixed(4)} & | & ${R2_prime_b.toFixed(4)} \\end{pmatrix} $$
        `;

        // Step 3: Back-Substitution
        // From the second row: R2_prime_a3 * y = R2_prime_b
        const y = R2_prime_b / R2_prime_a3;

        workingText += `<p>3. **Back-Substitution** (from $\\mathbf{R_2}$):</p>
            $$ ${R2_prime_a3.toFixed(4)}y = ${R2_prime_b.toFixed(4)} \\implies y = \\frac{${R2_prime_b.toFixed(4)}}{${R2_prime_a3.toFixed(4)}} = ${y.toFixed(4)} $$
        `;

        // From the first row: a0 * x + a1 * y = b_val0
        const x_num = b_val0 - a1 * y;
        const x = x_num / a0;

        workingText += `<p>4. **Back-Substitution** (into $\\mathbf{R_1}$):</p>
            $$ ${a0}x + ${a1}(${y.toFixed(4)}) = ${b_val0} $$
            $$ ${a0}x = ${b_val0} - (${a1} \\cdot ${y.toFixed(4)}) = ${x_num.toFixed(4)} $$
            $$ x = \\frac{${x_num.toFixed(4)}}{${a0}} = ${x.toFixed(4)} $$
        `;

        return {
            solution: { x: x, y: y },
            workingText: workingText
        };
    }

    function calculateMatrixInversion(A, b, det) {
        const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
        const b1 = b[0], b2 = b[1];

        // Inverse Matrix elements:
        const inv_a11 = a22 / det;
        const inv_a12 = -a12 / det;
        const inv_a21 = -a21 / det;
        const inv_a22 = a11 / det;

        const x = inv_a11 * b1 + inv_a12 * b2;
        const y = inv_a21 * b1 + inv_a22 * b2;

        const workingText = `
            <p>1. Calculate the **Determinant (D)** of $\\mathbf{A}$: $D = ${det}$.</p>
            <p>2. Calculate the **Adjugate Matrix** ($\\text{adj}(\\mathbf{A})$):</p>
            $$ \\text{adj}(\\mathbf{A}) = \\begin{pmatrix} ${a22} & -${a12} \\\\ -${a21} & ${a11} \\end{pmatrix} $$
            <p>3. Calculate the **Inverse Matrix** $\\mathbf{A}^{-1} = \\frac{1}{D} \\text{adj}(\\mathbf{A})$:</p>
            $$ \\mathbf{A}^{-1} = \\frac{1}{${det}} \\begin{pmatrix} ${a22} & -${a12} \\\\ -${a21} & ${a11} \\end{pmatrix} = \\begin{pmatrix} ${inv_a11.toFixed(4)} & ${inv_a12.toFixed(4)} \\\\ ${inv_a21.toFixed(4)} & ${inv_a22.toFixed(4)} \\end{pmatrix} $$
            <p>4. Solve for $\\mathbf{x}$ using **Matrix Multiplication** $\\mathbf{x} = \\mathbf{A}^{-1}\\mathbf{b}$:</p>
            $$ \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ${inv_a11.toFixed(4)} & ${inv_a12.toFixed(4)} \\\\ ${inv_a21.toFixed(4)} & ${inv_a22.toFixed(4)} \\end{pmatrix} \\begin{pmatrix} ${b1} \\\\ ${b2} \\end{pmatrix} $$
            <p>Resulting components:</p>
            $$ x = (${inv_a11.toFixed(4)}) \\cdot (${b1}) + (${inv_a12.toFixed(4)}) \\cdot (${b2}) = ${x.toFixed(4)} $$
            $$ y = (${inv_a21.toFixed(4)}) \\cdot (${b1}) + (${inv_a22.toFixed(4)}) \\cdot (${b2}) = ${y.toFixed(4)} $$
        `;

        return {
            solution: { x: x, y: y },
            workingText: workingText
        };
    }

    // --- DISPLAY AND FORM HANDLING ---

    const form = document.getElementById('solver-form');
    const resultsDiv = document.getElementById('results');
    const finalSolutionSpan = document.getElementById('final-solution');
    const detInfo = document.getElementById('determinant-info');
    const cramersOutput = document.getElementById('cramers-rule-output');
    const gaussianOutput = document.getElementById('gaussian-elimination-output');
    const matrixInversionOutput = document.getElementById('matrix-inversion-output'); // Renamed
    const vectorPlotOutput = document.getElementById('vector-plot-output'); // New
    const scalarLineOutput = document.getElementById('scalar-line-output'); // Renamed

    // Initial render for the system example in index.html
    document.querySelectorAll('.math-display').forEach(element => {
        renderOutput(element, element.innerHTML);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get Input Values
        const a11 = parseFloat(document.getElementById('a11').value);
        const a12 = parseFloat(document.getElementById('a12').value);
        const b1 = parseFloat(document.getElementById('b1').value);
        const a21 = parseFloat(document.getElementById('a21').value);
        const a22 = parseFloat(document.getElementById('a22').value);
        const b2 = parseFloat(document.getElementById('b2').value);

        // Basic validation for division by zero (for slopes/intercepts)
        if (a12 === 0 || a22 === 0 || a11 === 0) {
            alert("Warning: Some coefficients are zero, which might lead to division by zero for slope-intercept form. Please adjust or interpret results carefully.");
        }


        // 2. Solve System
        const result = solveSystem(a11, a12, b1, a21, a22, b2);

        // 3. Display Results
        displayResults(result);
    });

    function displayResults(result) {
        resultsDiv.classList.remove('hidden');

        // Display Final Solution / No Unique Solution Message
        finalSolutionSpan.textContent = result.solution;
        
        // Display Determinant Information
        renderOutput(detInfo, `Determinant $\\mathbf{D}$ of $\\mathbf{A}$: ${result.determinant}`);

        // Clear previous outputs
        cramersOutput.innerHTML = '';
        gaussianOutput.innerHTML = '';
        matrixInversionOutput.innerHTML = '';
        vectorPlotOutput.innerHTML = '';
        scalarLineOutput.innerHTML = '';

        if (result.determinant === 0) {
            cramersOutput.textContent = 'Cannot use Cramer\'s Rule (D = 0).';
            gaussianOutput.textContent = 'System has no unique solution (D = 0).';
            matrixInversionOutput.textContent = 'Inverse Matrix does not exist (D = 0).';
            vectorPlotOutput.textContent = 'Vector interpretation also shows no unique combination (D = 0).';
            scalarLineOutput.textContent = 'Lines are parallel or coincident (D = 0).';
            return;
        }

        // Display working for each method
        renderOutput(cramersOutput, result.methods.cramersRule.workingText);
        renderOutput(gaussianOutput, result.methods.gaussianElimination.workingText);
        renderOutput(matrixInversionOutput, result.methods.matrixInversion.workingText);
        
        // Display Vector Interpretation for Plotting
        displayVectorPlottingData(result.vectorPlotData);

        // Display Scalar Line Equations for Plotting
        displayScalarLinePlottingData(result.scalarLinePlotData);
    }

    // Function to display vector plotting data
    function displayVectorPlottingData(data) {
        const html = `
            <p>The system $\\mathbf{A}\\mathbf{x} = \\mathbf{b}$ can be viewed as finding scalars $x$ and $y$ (from the solution vector $\\mathbf{x}$) that linearly combine the column vectors of $\\mathbf{A}$ to produce the constant vector $\\mathbf{b}$.</p>
            <h4>Key Vectors for Plotting:</h4>
            <ul>
                <li>**Column Vector 1** (from $\\mathbf{A}$): $\\vec{v_1} = \\begin{pmatrix} ${data.column_vector1.x} \\\\ ${data.column_vector1.y} \\end{pmatrix}$</li>
                <li>**Column Vector 2** (from $\\mathbf{A}$): $\\vec{v_2} = \\begin{pmatrix} ${data.column_vector2.x} \\\\ ${data.column_vector2.y} \\end{pmatrix}$</li>
                <li>**Solution Vector** (the scalars): $\\mathbf{x} = \\begin{pmatrix} ${data.solution_vector.x} \\\\ ${data.solution_vector.y} \\end{pmatrix}$</li>
                <li>**Constant Vector** (from $\\mathbf{b}$): $\\vec{b} = \\begin{pmatrix} ${data.constant_vector_b.x} \\\\ ${data.constant_vector_b.y} \\end{pmatrix}$</li>
            </ul>
            <h4>Linear Combination Visualisation:</h4>
            <p>The solution means:</p>
            $$ ${data.linear_combination_equation} $$
            <p>To plot this: draw $\\vec{v_1}$ scaled by $x$, then from its endpoint, draw $\\vec{v_2}$ scaled by $y$. The final point should be the tip of $\\vec{b}$.</p>
            <p class="plot-hint">For example, using the solution $(x, y) = (${data.solution_vector.x}, ${data.solution_vector.y})$, you can plot:</p>
            <ul>
                <li>Vector $\\vec{x \\cdot v_1} = \\begin{pmatrix} ${ (data.solution_vector.x * data.column_vector1.x).toFixed(4) } \\\\ ${ (data.solution_vector.x * data.column_vector1.y).toFixed(4) } \\end{pmatrix}$</li>
                <li>Vector $\\vec{y \\cdot v_2} = \\begin{pmatrix} ${ (data.solution_vector.y * data.column_vector2.x).toFixed(4) } \\\\ ${ (data.solution_vector.y * data.column_vector2.y).toFixed(4) } \\end{pmatrix}$</li>
            </ul>
        `;
        renderOutput(vectorPlotOutput, html);
    }

    // Function to display scalar line plotting data
    function displayScalarLinePlottingData(data) {
        const html = `
            <p>In the scalar (Cartesian) coordinate system, the two equations represent straight lines. The solution $(x,y)$ is the point where these two lines intersect.</p>
            <h4>Line Equations (Slope-Intercept Form $y=mx+b$):</h4>
            <p>To plot, rearrange each equation into $y=mx+b$ form.</p>
            <ul>
                <li>**Equation 1**: ${data.line1_equation_form}</li>
                $$ y = (${data.line1_slope})x + ${data.line1_intercept} $$
                <li>**Equation 2**: ${data.line2_equation_form}</li>
                $$ y = (${data.line2_slope})x + ${data.line2_intercept} $$
            </ul>
            <h4>Intersection Point (Solution):</h4>
            <p class="final-point">The intersection point of these two lines is $\\mathbf{P}: (x, y) = (${data.intersection.x}, ${data.intersection.y})$</p>
            <p class="plot-hint">Plot these two lines; their intersection will be the solution.</p>
        `;
        renderOutput(scalarLineOutput, html);
    }

    // Function to render LaTeX using KaTeX
    function renderOutput(element, latexString) {
        // This regex specifically looks for $$...$$ for display math and $...$ for inline math
        const parts = latexString.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/); // Split by LaTeX delimiters
        element.innerHTML = ''; // Clear content

        parts.forEach(part => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                // Display math block
                const mathDiv = document.createElement('div');
                mathDiv.className = 'math-block display-math';
                try {
                    katex.render(part.slice(2, -2).trim(), mathDiv, { // Remove $$
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    mathDiv.textContent = 'Math rendering error: ' + part.trim();
                }
                element.appendChild(mathDiv);
            } else if (part.startsWith('$') && part.endsWith('$')) {
                // Inline math block
                const mathSpan = document.createElement('span');
                mathSpan.className = 'math-block inline-math';
                try {
                    katex.render(part.slice(1, -1).trim(), mathSpan, { // Remove $
                        throwOnError: false,
                        displayMode: false // Inline mode
                    });
                } catch (e) {
                    mathSpan.textContent = 'Math rendering error: ' + part.trim();
                }
                element.appendChild(mathSpan);
            } else {
                // Plain HTML text (can contain other HTML tags like <p>, <ul>, <li>)
                if (part.trim() !== '') { // Avoid adding empty text nodes
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = part.trim();
                    while (tempDiv.firstChild) {
                        element.appendChild(tempDiv.firstChild);
                    }
                }
            }
        });
    }

    // Initial calculation for the example values (2x+3y=7, 1x-2y=1)
    form.dispatchEvent(new Event('submit'));
});
