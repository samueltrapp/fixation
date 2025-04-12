import prompts from "prompts";

export const promptFile = async () =>
    await prompts({
        type: "text",
        name: "fileName",
        message: "Enter name of a CSV file to process",
    });