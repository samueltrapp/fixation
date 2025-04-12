import chalk from "chalk";
import { processData } from "./src/analysis.js";
import { handlePrompt } from "./src/utils.js";

const fileProps = await handlePrompt();
if (fileProps.data.length > 0 && fileProps.name) {
    await processData(fileProps);
    console.log(chalk.green("Finished!"));
}
else {
    console.log(chalk.red("Error in data"));
}
