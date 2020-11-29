const hungarian  = require('./hungarian');
const lists = require('./lists');
const prims = require('./prims');
const fleury = require('./fleury.js');

const distance = (a, b) => Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2))

const createWeightMatrix = (points) => {
    const matrix = [];

    for (let i = 0; i < points.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < points.length; j++) {
            matrix[i][j] = i === j ? Infinity : distance(points[i], points[j]);
        }
    }

    return matrix;
}

function* createBipartiteGraphs(edgeWeights, oddVertices) {

    const uVertexSets = lists.combinations(oddVertices, oddVertices.length / 2);

    for(const uSet of uVertexSets) {
        const
            vSet = [],
            weightMatrix = [];

        uSet.sort();

        for (let j = 0; j < oddVertices.length; j++) {
            if(uSet.indexOf(oddVertices[j]) === -1) {
                vSet.push(oddVertices[j]);
            }
        }

        for (let u = 0; u < uSet.length; u++) {
            weightMatrix[u] = [];
            for (let v = 0; v < vSet.length; v++) {
                weightMatrix[u][v] = edgeWeights[uSet[u]][vSet[v]];
            }
        }

        yield [weightMatrix, uSet, vSet];
    }
}

const perfectMatching = (adjMatrix, oddVertices) => {

    let minWeight = Infinity,
        bestBipartiteGraph,
        matches;

    let graphs = createBipartiteGraphs(adjMatrix, oddVertices);
    for (let graph of graphs) {
        const minimumMatches = hungarian(graph[0]);
        const weight = minimumMatches.reduce((sum, match) => sum + graph[0][match[0]][match[1]], 0);

        if(weight < minWeight) {
            minWeight = weight;
            matches = minimumMatches;
            bestBipartiteGraph = graph;
        }
    }

    const [,uSet, vSet] = bestBipartiteGraph;

    return matches.map(([u, v]) => [uSet[u], vSet[v]]);
}

const createEulerTour = (mst, matches) => fleury([...mst, ...matches])

const createHamiltonianTour = (euler) => {
    const tour = [];

    for (let v = 0; v < euler.length; v++) {
        if(tour.indexOf(euler[v]) === -1) {
            tour.push(euler[v]);
        }
    }

    return [...tour, euler[0]];
}

const christofides = (graph) => {

    const weights = createWeightMatrix(graph);

    // Cria mst e pega vértices impares
    const [mst, oddVertices] = prims(weights);

    // pega os acoplamentos perfeitos 
    const matches = perfectMatching(weights, oddVertices);

    // forma circuito euleriano
    const euler = createEulerTour(mst, matches);

    // transforma o circuito euleriano em circuito hamiltoniano
    const hamiltonian = createHamiltonianTour(euler);

    let min_path = 0;
    for (let v = 0; v < hamiltonian.length - 1; v++) {
        min_path += weights[hamiltonian[v]][hamiltonian[v+1]];
    }

    return min_path;
}

module.exports = (graph, callback) => callback(christofides(graph))
