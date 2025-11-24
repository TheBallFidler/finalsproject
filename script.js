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
            <p>2. Calculate $\\mathbf{D_x}$
