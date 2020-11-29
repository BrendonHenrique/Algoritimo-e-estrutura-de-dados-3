// Retorna uma matrix com a permutação de um array
 const permute = array => {
    return array.reduce(function permute(res, item, key, arr) {
        return res.concat(
            arr.length > 1 && arr.slice(0, key).concat(
                arr.slice(key + 1)
            ).reduce(permute, []).map(function(perm) {
                return [item].concat(perm);
            }) || item);
    }, [])
}

// retorna um array com o range de 0 até n
const range = n => [...Array(n).keys()]

class TSPSolverExato { 
    constructor(graph, problemSize) {
        this.graph = graph 
        this.problemSize = problemSize
        this.vector = []
        this.start = 0
        this.min_path = Number.MAX_SAFE_INTEGER
    }
     
    calculateMinPath(callback) {

        // Armazena todos os vertices
        range(this.problemSize)
            .forEach( i => i !== this.start && this.vector.push(i))
        
        // Calcula o peso 
        permute(this.vector)
            .forEach(i => { 
            
                let current_pathWeight = 0
                let k = this.start 

                i.forEach(j => { 
                    current_pathWeight = current_pathWeight + this.graph[k][j]
                    k = j
                })

                // Atualiza o peso 
                current_pathWeight = current_pathWeight + this.graph[k][this.start]
                this.min_path = Math.min(this.min_path, current_pathWeight)
            }
        )
        
        // retorna em uma função de callback o calculo total do peso
        callback(this.min_path)
    }
}

module.exports = TSPSolverExato;