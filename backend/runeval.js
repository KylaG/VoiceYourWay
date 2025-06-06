/**
 * How to use:
 * 
 * 1) Write test queries in the format matching nav-queries.txt
 * 
 * 2) Update the file paths in the main function
 * 
 * 3) run node runevals.js
 */


import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { dirname } from "path";
import { sendToClaude } from "./claude.js";


function parseQueries(filePath) {
    const data = readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    
    const easy = [];
    const medium = [];
    const hard = [];
    
    lines.forEach(line => {
        if (!line.trim() || line.startsWith('#')) return;
        
        const [difficulty, query] = line.split('|');
        
        if (difficulty === 'EASY') {
            easy.push(query);
        } else if (difficulty === 'MEDIUM') {
            medium.push(query);
        } else if (difficulty === 'HARD') {
            hard.push(query);
        }
    });
    
    return { easy, medium, hard };
}


async function main() {
    const queriesFile = "./nav-queries.txt";
    const queries = parseQueries(queriesFile);

    // Default user location coordinates for evals
    const DEFAULT_USER_LOCATION = "37.42625895112381,-122.18137409834223";

    const easyOutputFile = "./eval-results/nav-easy.txt";
    const mediumOutputFile = "./eval-results/nav-medium.txt";
    const hardOutputFile = "./eval-results/nav-hard.txt";

    // Ensure output directories exist
    mkdirSync(dirname(easyOutputFile), { recursive: true });
    mkdirSync(dirname(mediumOutputFile), { recursive: true });
    mkdirSync(dirname(hardOutputFile), { recursive: true });

    // Clear the output files
    writeFileSync(easyOutputFile, "");
    writeFileSync(mediumOutputFile, "");
    writeFileSync(hardOutputFile, "");

    // // Process easy queries
    // for (let i = 0; i < queries.easy.length; i++) {
    //     console.log(`Working on EASY query ${i}:`, queries.easy[i]);
    //     writeFileSync(easyOutputFile, queries.easy[i] + "\n", { flag: "a" });
    //     try {
    //         const url = await sendToClaude(queries.easy[i]);
    //         console.log("Result:", url);
    //         writeFileSync(easyOutputFile, url + "\n", { flag: "a" });
    //     } catch (error) {
    //         console.log("Result:", error);
    //         writeFileSync(easyOutputFile, "Error\n", { flag: "a" });
    //     }
    // }

    // // Process medium queries
    // for (let i = 0; i < queries.medium.length; i++) {
    //     console.log(`Working on MEDIUM query ${i}:`, queries.medium[i]);
    //     writeFileSync(mediumOutputFile, queries.medium[i] + "\n", { flag: "a" });
    //     try {
    //         const url = await sendToClaude(queries.medium[i]);
    //         console.log("Result:", url);
    //         writeFileSync(mediumOutputFile, url + "\n", { flag: "a" });
    //     } catch (error) {
    //         console.log("Result:", error);
    //         writeFileSync(mediumOutputFile, "Error\n", { flag: "a" });
    //     }
    // }

    // Process hard queries
    for (let i = 0; i < queries.hard.length; i++) {
        console.log(`Working on HARD query ${i}:`, queries.hard[i]);
        writeFileSync(hardOutputFile, queries.hard[i] + "\n", { flag: "a" });
        try {
            const url = await sendToClaude(queries.hard[i], DEFAULT_USER_LOCATION);
            console.log("Result:", url);
            writeFileSync(hardOutputFile, url + "\n", { flag: "a" });
        } catch (error) {
            console.log("Result:", error);
            writeFileSync(hardOutputFile, "Error\n", { flag: "a" });
        }
    }
}


main();
