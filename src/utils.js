import chalk from 'chalk';
import { promptFile } from '../cli/prompts.js';
import { parse } from "csv-parse";
import { open } from "node:fs/promises";
import { config } from '../config.js';

const readFile = async (fileName) => {
    const { containsHeader } = config;
    const fd = await open(fileName);
    const stream = fd.createReadStream();
    const options = {
        delimiter: ',',
        from_line: containsHeader ? 2 : 1
    };

    const data = [];
    return new Promise((resolve, reject) => {
        stream.pipe(parse(options))
            .on('data', (csvrow) => {
                data.push({
                    id: parseInt(csvrow[0]),
                    frame: parseInt(csvrow[1]),
                    angle: parseFloat(csvrow[2])
                });
            })
            .on("error", (err) => {
                console.log(chalk.red(`Error reading CSV file ${fileName}: ${err}`));
                reject(err);
            })
            .on("end", () => {
                resolve(data);
            })
    });
};

export const handlePrompt = async () => {
    const prompt = await promptFile();
    const fileNameWithoutExtension = prompt.fileName.replace(/\.csv$/, "");
    console.log(chalk.blue("Processing file..."));
    const data = await readFile(fileNameWithoutExtension + ".csv");
    return {
        data,
        name: fileNameWithoutExtension
    };
};