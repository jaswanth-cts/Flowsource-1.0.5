const projectName = {
    type: "string",
    title: "Project",
    description: "The name of the Aws project.",
};
const repositoryName = {
    type: "string",
    title: "Repository Name",
    description: "The name of the repository.",
};
const pipelineName = {
    type: "string",
    title: "Pipeline Name",
    description: "The name of the pipeline.",
};
const branchName = {
    type: "string",
    title: "Branch Name",
    description: "The name of the branch.",
};
const buildSpec = {
    type: "string",
    title: "Build Spec File Name",
    description: "The name of the buildspec file.",
};
const region = {
    type: "string",
    title: "aws Region",
    description: "The name of the aws Region.",
};


export { projectName };
export { repositoryName };
export { pipelineName };
export { branchName };
export { buildSpec };
export { region }