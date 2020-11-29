const   PRISTINE = 0,
        MARKED = 1,
        CANCELED = 2;

function Munkres(adjMatrix) {
    this.adjMatrix = adjMatrix.map(itm => [...itm]);
    this.n = this.adjMatrix.length;
    this.resetMarkTable();
}

Munkres.prototype.findSmallestValue = function() {
    let smallestEntry = Infinity;
    for (let r = 0; r < this.adjMatrix.length; r++) {
        for (let c = 0; c < this.adjMatrix[r].length; c++) {

            if (this.coveredRows.indexOf(r) === -1 && this.coveredCols.indexOf(c) === -1) {
                if (this.adjMatrix[r][c] < smallestEntry) {
                    smallestEntry = this.adjMatrix[r][c];
                }
            }
        }
    }

    return smallestEntry;
};

Munkres.prototype.lines = function () {

    let
        tickedRows = [],
        tickedCols = [];

    for (let r = 0; r < this.n; r++) {
        let assignment = false;
        for (let c = 0; c < this.n; c++) {
            if (this.markedTable[r][c] === MARKED) {
                assignment = true;
            }
        }

        if (!assignment) {
            tickedRows.push(r);
            break;
        }
    }

    let colsToTick = [];
    do {
        tickedCols = [...tickedCols, ...colsToTick];
        colsToTick = [];

        for (let r = 0; r < tickedRows.length; r++) {
            for (let c = 0; c < this.n; c++) {
                if (this.adjMatrix[tickedRows[r]][c] === 0) {
                    if (tickedCols.indexOf(c) === -1) {
                        colsToTick.push(c);
                    }
                }
            }
        }

        for (let c = 0; c < colsToTick.length; c++) {
            for (let r = 0; r < this.n; r++) {
                if (this.markedTable[r][colsToTick[c]] === MARKED) {
                    if (tickedRows.indexOf(r) === -1) {
                        tickedRows.push(r);
                    }
                }
            }
        }
    } while (colsToTick.length);

    const untickedRows = [];
    for (let r = 0; r < this.n; r++) {
        if (tickedRows.indexOf(r) === -1) {
            untickedRows.push(r);
        }
    }

    this.coveredRows = untickedRows;
    this.coveredCols = tickedCols;
};

Munkres.prototype.addZeros = function () {
    this.lines();
    const smallestValue = this.findSmallestValue();

    const uncoveredRows = [];

    for (let r = 0; r < this.n; r ++) {
        if(this.coveredRows.indexOf(r) === -1) {
            uncoveredRows.push(r);
        }
    }

    for (let r = 0; r < uncoveredRows.length; r++) {
        for (let c = 0; c < this.n; c ++) {
            this.adjMatrix[uncoveredRows[r]][c] -= smallestValue;
        }
    }

    for (let c = 0; c < this.coveredCols.length; c++) {
        for (let r = 0; r < this.n; r++) {
            this.adjMatrix[r][this.coveredCols[c]] += smallestValue;
        }
    }
};

Munkres.prototype.resetMarkTable = function () {
    this.markedTable = [];

    for (let r = 0; r < this.n; r++) {
        this.markedTable[r] = [];
        for (let c = 0; c < this.n; c++) {
            this.markedTable[r][c] = PRISTINE;
        }
    }
};

Munkres.prototype.alternateToFindAssignments = function () {

    let assignmentCount = 0;

    while(true) {
        let tmpMarkTable = this.markedTable.map(row => [...row]);
        for (let r = 0; r < this.n; r++) {
            let zeroCount = 0, zeroIndex = -1;

            for (let c = 0; c < this.n; c++) {
                if(this.adjMatrix[r][c] === 0 && this.markedTable[r][c] === PRISTINE) {
                    zeroCount++;
                    zeroIndex = c;
                }
            }

            if(zeroCount === 1 && tmpMarkTable[r][zeroIndex] === PRISTINE) {

                assignmentCount++;

                for (let r = 0; r < this.n; r++) {
                    if(this.adjMatrix[r][zeroIndex] === 0) {
                        tmpMarkTable[r][zeroIndex] = CANCELED
                    }
                }

                tmpMarkTable[r][zeroIndex] = MARKED;
            }
        }

        for (let c = 0; c < this.n; c++) {
            let zeroCount = 0, zeroIndex = -1;

            for (let r = 0; r < this.n; r++) {

                if(this.adjMatrix[r][c] === 0 && this.markedTable[r][c] === PRISTINE) {
                    zeroCount++;
                    zeroIndex = r;
                }
            }

            if(zeroCount === 1  && tmpMarkTable[zeroIndex][c] === PRISTINE) {

                assignmentCount++;

                for (let c = 0; c < this.n; c++) {
                    if(this.adjMatrix[zeroIndex][c] === 0) {
                        tmpMarkTable[zeroIndex][c] = CANCELED;
                    }
                }

                tmpMarkTable[zeroIndex][c] = MARKED;
            }
        }

        if(assignmentCount < this.n) {

            if(this.hasOpenZeros()) {
                this.markedTable = tmpMarkTable;
            } else {
                this.addZeros();
                this.resetMarkTable();
                assignmentCount = 0;
            }
        } else {

            const matches = [];

            for (let r = 0; r < this.n; r++) {
                for (let c = 0; c < this.n; c++) {
                    if(tmpMarkTable[r][c] === MARKED) {
                        matches.push([r,c]);
                    }
                }
            }

            return matches;
        }
    }
};

Munkres.prototype.compute = function() {

    for (let r = 0; r < this.n; r++) {
        const minEntry = Math.min(...this.adjMatrix[r]);
        for (let c = 0; c < this.n; c++) {
            this.adjMatrix[r][c] = this.adjMatrix[r][c] - minEntry;
        }
    }

    for (let c = 0; c < this.n; c++) {
        const minEntry = Math.min(...this.adjMatrix.map(row => row[c]));
        for (let r = 0; r < this.n; r++) {
            this.adjMatrix[r][c] = this.adjMatrix[r][c] - minEntry;
        }
    }

    return this.alternateToFindAssignments();
};

Munkres.prototype.hasOpenZeros = function () {
    for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.n; c++) {
            if(this.adjMatrix[r][c] === 0 && this.markedTable[r][c] === PRISTINE) {
                return true;
            }
        }
    }

    return false;
};

function munkres(adjMatrix) {
    return (new Munkres(adjMatrix)).compute();
}

module.exports = munkres;