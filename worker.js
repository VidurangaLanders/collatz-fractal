// Collatz calculation function - ORIGINAL VERSION
function collatz(n, x, y) {
    let r = (n % x);
    if (n % y === 0) {
        return n / y;
    } else {
        return ((n * (x + 1) + (x - r)) / y);
    }
}

// Calculate sequence for a given starting number - ORIGINAL VERSION
function calculateSequence(params) {
    const { start, x, y } = params;
    let sequence = [];
    let n = start;
    let iterations = 0;
    const maxIterations = 100000; // Prevent infinite loops
    
    do {
        sequence.push(n);
        n = collatz(n, x, y);
        iterations++;
        
        // Safety check to prevent infinite loops or memory issues
        if (iterations > maxIterations) {
            console.warn(`Sequence truncated at ${maxIterations} iterations for start value ${start}`);
            break;
        }
        
        // Additional safety check for very large numbers
        if (n > Number.MAX_SAFE_INTEGER / 2) {
            console.warn(`Sequence truncated due to large number for start value ${start}`);
            break;
        }
        
    } while (n !== 1 && iterations < maxIterations);
    
    if (n === 1) {
        sequence.push(1);
    }
    
    return sequence.reverse();
}

// Handle messages from main thread
self.onmessage = function(e) {
    try {
        const sequence = calculateSequence(e.data);
        self.postMessage(sequence);
    } catch (error) {
        self.postMessage({
            error: true,
            message: `Calculation error: ${error.message}`,
            params: e.data
        });
    }
};