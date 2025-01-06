// Collatz calculation function
function collatz(n, x, y) {
    let r = (n % x);
    if (n % y === 0) {
        return n / y;
    } else {
        return ((n * (x + 1) + (x - r)) / y);
    }
}

// Calculate sequence for a given starting number
function calculateSequence(params) {
    const { start, x, y } = params;
    let sequence = [];
    let n = start;
    do {
        sequence.push(n);
        n = collatz(n, x, y);
    } while (n !== 1);
    sequence.push(1);
    return sequence.reverse();
}

// Handle messages from main thread
self.onmessage = function(e) {
    const sequence = calculateSequence(e.data);
    self.postMessage(sequence);
};