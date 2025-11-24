document.addEventListener('DOMContentLoaded', () => {
    // --- MAIN CALCULATION FUNCTIONS (Same as previous response) ---

    // Let the system be: a11*x + a12*y = b1 and a21*x + a22*y = b2
    function solveSystem(a11, a12, b1, a21, a22, b2) {
        const A = [[a11, a12], [a21, a22]];
        const b = [b1, b2];

        const output = {
            determinant: null,
            solution: null,
            methods: {}
        };

        // Calculate Determinant
        const det = a11 * a22 - a12 * a21;
        output.determinant = det;

        if (det === 0) {
            output.solution = "No unique solution (Determinant is 0). The system is either inconsistent or dependent.";
            return output;
        }

        // --- 1. Cramer's Rule ---
        output.methods.cramersRule = calculateCramersRule(A, b, det);

        // --- 2. Gaussian Elimination ---
        output.methods.gaussianElimination = calculateGaussianElimination(A, b);

        // --- 3. Vector Method (Matrix Inversion) ---
        output.methods.vectorMethod = calculateVectorMethod(A, b, det);

        // The solutions should be the same across all methods (using Cramer's for the final answer)
        const finalX = output.methods.cramersRule.solution.x.toFixed(4);
        const finalY = output.methods.cramersRule.solution.y.toFixed(4);
        output.solution = `x = ${finalX}, y = ${finalY}`;

        return output;
    }

    function calculateCramersRule(A, b, det) {
        const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
        const b1 = b[0], b2 = b[1];

        const det_x = b1 * a22 - a12 * b2;
        const det_y = a11 * b2 - b1 * a21;

        const x = det_x / det;
        const y = det_y / det;

        const latexWorking = `
            <p>1. Calculate the determinant of $\\mathbf{A}$:</p>
            $$ D = \\begin{vmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{vmatrix} = (${a11})(${a22}) - (${a12})(${a21}) = ${det} $$
            <p>2. Calculate $\\mathbf{D_x}$ (replace column 1 with $\\mathbf{b}$):</p>
            $$ D_x = \\begin{vmatrix} ${b1} & ${a12} \\\\ ${b2} & ${a22} \\end{vmatrix} = (${b1})(${a22}) - (${a12})(${b2}) = ${det_x} $$
            <p>3. Calculate $\\mathbf{D_y}$ (replace column 2 with $\\mathbf{b}$):</p>
            $$ D_y = \\begin{vmatrix} ${a11} & ${b1} \\\\ ${a21} & ${b2} \\end{vmatrix} = (${a11})(${b2}) - (${b1})(${a21}) = ${det_y} $$
            <p>4. Calculate $\\mathbf{x}$ and $\\mathbf{y}$:</p>
            $$ x = \\frac{D_x}{D} = \\frac{${det_x}}{${det}} = ${x.toFixed(4)} $$
            $$ y = \\frac{D_y}{D} = \\frac{${det_y}}{${det}} = ${y.toFixed(4)} $$
        `;

        return {
            solution: { x: x, y: y },
            latexWorking: latexWorking
        };
    }

    function calculateGaussianElimination(A, b) {
        let a = [...A[0]], b_val = b[0];
        let c = [...A[1]], d_val = b[1];
        
        let latexWorking = `<p>1. Start with Augmented Matrix:</p>
            $$ \\begin{pmatrix} ${a[0]} & ${a[1]} & | & ${b_val} \\\\ ${c[0]} & ${c[1]} & | & ${d_val} \\end{pmatrix} $$
        `;

        const factor = c[0] / a[0];
        const new_c1 = c[1] - factor * a[1];
        const new_d_val = d_val - factor * b_val;

        latexWorking += `<p>2. Eliminate the first term in $\\mathbf{R_2}$ using the pivot in $\\mathbf{R_1}$ ($\\mathbf{R_2} \\leftarrow \\mathbf{R_2} - \\frac{${c[0]}}{${a[0]}} \\mathbf{R_1}$):</p>
            $$ \\mathbf{R_2}: \\left( ${c[0]} - ${factor.toFixed(4)} \\cdot ${a[0]} \\right)x + \\left( ${c[1]} - ${factor.toFixed(4)} \\cdot ${a[1]} \\right)y = ${d_val} - ${factor.toFixed(4)} \\cdot ${b_val} $$
            <p>Resulting Matrix (Row Echelon Form):</p>
            $$ \\begin{pmatrix} ${a[0]} & ${a[1]} & | & ${b_val} \\\\ 0 & ${new_c1.toFixed(4)} & | & ${new_d_val.toFixed(4)} \\end{pmatrix} $$
        `;

        // Step 3: Back-Substitution
        const y = new_d_val / new_c1;

        latexWorking += `<p>3. Back-Substitution (from $\\mathbf{R_2}$):</p>
            $$ ${new_c1.toFixed(4)}y = ${new_d_val.toFixed(4)} \\implies y = \\frac{${new_d_val.toFixed(4)}}{${new_c1.toFixed(4)}} = ${y.toFixed(4)} $$
        `;

        // From the first row: a[0] * x + a[1] * y = b_val
        const x_num = b_val - a[1] * y;
        const x = x_num / a[0];

        latexWorking += `<p>4. Back-Substitution (into $\\mathbf{R_1}$):</p>
            $$ ${a[0]}x + ${a[1]}(${y.toFixed(4)}) = ${b_val} \\implies ${a[0]}x = ${b_val} - ${a[1]}y = ${x_num.toFixed(4)} $$
            $$ x = \\frac{${x_num.toFixed(4)}}{${a[0]}} = ${x.toFixed(4)} $$
        `;

        return {
            solution: { x: x, y: y },
            latexWorking: latexWorking
        };
    }

    function calculateVectorMethod(A, b, det) {
        const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
        const b1 = b[0], b2 = b[1];

        // Inverse Matrix elements:
        const inv_a11 = a22 / det;
        const inv_a12 = -a12 / det;
        const inv_a21 = -a21 / det;
        const inv_a22 = a11 / det;

        // x = A⁻¹ * b (Matrix Multiplication)
        const x = inv_a11 * b1 + inv_a12 * b2;
        const y = inv_a21 * b1 + inv_a22 * b2;

        const latexWorking = `
            <p>1. Calculate the Adjugate Matrix:</p>
            $$ \\text{adj}(\\mathbf{A}) = \\begin{pmatrix} ${a22} & -${a12} \\\\ -${a21} & ${a11} \\end{pmatrix} $$
            <p>2. Calculate the Inverse Matrix $\\mathbf{A}^{-1} = \\frac{1}{D} \\text{adj}(\\mathbf{A})$ ($D=${det}$):</p>
            $$ \\mathbf{A}^{-1} = \\frac{1}{${det}} \\begin{pmatrix} ${a22} & -${a12} \\\\ -${a21} & ${a11} \\end{pmatrix} = \\begin{pmatrix} ${inv_a11.toFixed(4)} & ${inv_a12.toFixed(4)} \\\\ ${inv_a21.toFixed(4)} & ${inv_a22.toFixed(4)} \\end{pmatrix} $$
            <p>3. Solve for $\\mathbf{x}$ using $\\mathbf{x} = \\mathbf{A}^{-1}\\mathbf{b}$:</p>
            $$ \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ${inv_a11.toFixed(4)} & ${inv_a12.toFixed(4)} \\\\ ${inv_a21.toFixed(4)} & ${inv_a22.toFixed(4)} \\end{pmatrix} \\begin{pmatrix} ${b1} \\\\ ${b2} \\end{pmatrix} = \\begin{pmatrix} ${inv_a11.toFixed(4)} \\cdot ${b1} + ${inv_a12.toFixed(4)} \\cdot ${b2} \\\\ ${inv_a21.toFixed(4)} \\cdot ${b1} + ${inv_a22.toFixed(4)} \\cdot ${b2} \\end{pmatrix} $$
            $$ \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ${x.toFixed(4)} \\\\ ${y.toFixed(4)} \\end{pmatrix} $$
        `;

        return {
            solution: { x: x, y: y },
            latexWorking: latexWorking
        };
    }

    // --- DISPLAY AND FORM HANDLING ---

    const form = document.getElementById('solver-form');
    const resultsDiv = document.getElementById('results');
    const finalSolutionSpan = document.getElementById('final-solution');
    const detInfo = document.getElementById('determinant-info');
    const cramersOutput = document.getElementById('cramers-rule-output');
    const gaussianOutput = document.getElementById('gaussian-elimination-output');
    const vectorOutput = document.getElementById('vector-method-output');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get Input Values
        const a11 = parseFloat(document.getElementById('a11').value);
        const a12 = parseFloat(document.getElementById('a12').value);
        const b1 = parseFloat(document.getElementById('b1').value);
        const a21 = parseFloat(document.getElementById('a21').value);
        const a22 = parseFloat(document.getElementById('a22').value);
        const b2 = parseFloat(document.getElementById('b2').value);

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
        detInfo.textContent = `Determinant (D) of A: ${result.determinant}`;

        // Clear previous outputs
        cramersOutput.innerHTML = '';
        gaussianOutput.innerHTML = '';
        vectorOutput.innerHTML = '';

        if (result.determinant === 0) {
            cramersOutput.textContent = 'Cannot use Cramer\'s Rule (D = 0).';
            gaussianOutput.textContent = 'System has no unique solution (D = 0).';
            vectorOutput.textContent = 'Inverse Matrix does not exist (D = 0).';
            return;
        }

        // Display working for each method (using KaTeX to render LaTeX strings)
        renderOutput(cramersOutput, result.methods.cramersRule.latexWorking);
        renderOutput(gaussianOutput, result.methods.gaussianElimination.latexWorking);
        renderOutput(vectorOutput, result.methods.vectorMethod.latexWorking);
    }

    // Function to render LaTeX using KaTeX
    function renderOutput(element, latexString) {
        // Simple function to parse the HTML/LaTeX string and render math blocks
        const parts = latexString.split(/\$\$/);
        
        element.innerHTML = ''; // Clear content

        parts.forEach((part, index) => {
            if (index % 2 === 1) {
                // This is a $$...$$ display math block
                const mathDiv = document.createElement('div');
                try {
                    katex.render(part.trim(), mathDiv, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    mathDiv.textContent = 'Math rendering error.';
                }
                element.appendChild(mathDiv);
            } else {
                // This is plain HTML text or <p> tags
                const textDiv = document.createElement('div');
                textDiv.innerHTML = part.trim();
                element.appendChild(textDiv);
            }
        });
    }

    // Initial calculation for the example values (2x+3y=7, 1x-2y=1)
    form.dispatchEvent(new Event('submit'));
});
