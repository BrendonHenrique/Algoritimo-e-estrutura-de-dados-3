const { promises: fs } = require("fs");
const inquirer = require('inquirer');
const eol = require("eol");
const TSPSolverExato = require("./src/TSPSolverExato");
const TSPSolverAproximativo = require("./src/TSPSolverAproximativo");
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;
const TSPdir = './data';

const enumAlgorithms = {
    EXATO: "exato",
    APROXIMATIVO: "aproximativo",
};

(async () => {
    try {
        // Lê as instâncias do caixeiro viajante dentro da pasta /data
        async function ls(path) {
            const dir = await fs.opendir(path)
            const files = []
            for await (const dirent of dir) {
                files.push(dirent.name)
            }
            return files
        }

        // Lê uma instância do caixeiro viajante
        async function loadTSP(file) {
            return await fs.readFile(`${TSPdir}/${file}`, 'utf-8')
        }

        // Menu de opções
        inquirer.prompt([
            {
                type: 'list',
                name: 'algorithm',
                message: 'Selecione o tipo de algoritimo que tu deseja utilizar',
                choices: [enumAlgorithms.EXATO, enumAlgorithms.APROXIMATIVO],
            },
            {
                type: 'list',
                name: 'file',
                message: 'Selecione a instância do caixeiro viajante que tu deseja resolver',
                choices: [...await ls('./data')],
            },
        ])
        .then(async ({algorithm, file}) => {
            
            // Lê as instâncias do caixeiro viajante
            const instanciaTSP = await loadTSP(file);

            // Transforma o conteúdo do txt em matrix[number][number] 
            let lines = eol.split(instanciaTSP)
            const TSPMatrix = [];
            lines.forEach(line => {
                let TSPLine = []
                
                line.split(' ')
                .filter(char => !!char && char)
                .forEach(char => TSPLine.push(parseInt(char)))

                TSPMatrix.push(TSPLine)
            })

            // inicio cronometro  
            const time = process.hrtime();

            if(algorithm == enumAlgorithms.EXATO) {

                // Execução do TSPSolver Exato
                const tspSolverExato = new TSPSolverExato(TSPMatrix, lines.length)
                tspSolverExato.calculateMinPath((min_path) => { 
                    
                    // Término  cronometro
                    const diff = process.hrtime(time)
                    console.log(`Tempo de execução: ${(diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milisegundos`)
                    console.log(`Resultado: ${min_path}`)
                })
           
            } else { 

                // Execução do TSPSolver Aproximativo
                TSPSolverAproximativo(TSPMatrix, (min_path) => { 
                    
                    // Término  cronometro
                    const diff = process.hrtime(time)
                    console.log(`Tempo de execução: ${(diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milisegundos`)
                    console.log(`Resultado: ${min_path}`)
                })
           
            }
          }
        )
    } catch (e) {
        console.log("e", e)
    }
})()
