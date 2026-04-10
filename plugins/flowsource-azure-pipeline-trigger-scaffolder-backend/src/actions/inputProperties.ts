const organization = {
    type: "string",
    title: "Organization",
    description: "The name of the Azure DevOps organization.",
};
const project = {
    type: "string",
    title: "Project",
    description: "The name of the Azure project.",
};
const repositoryName = {
    type: "string",
    title: "Repository Name",
    description: "The name of the repository.",
};

const repoType = {
    type: "string",
    title: "Repository Type",
    description: "The type of the repository.",
};

const branchName = {
    type: "string",
    title: "Branch Name",
    description: "The Branch Name of the repository.",
};

const serviceConnectionName = {
    type: "string",
    title: "Service Connection Name",
    description: "The Service Connection Name to be used in Azure Pipeline to Link GitHUb Repository.",
};


export { organization };
export { project };
export { repositoryName };
export { repoType };
export { branchName };
export { serviceConnectionName };
