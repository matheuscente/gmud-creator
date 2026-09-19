#!/usr/bin/env node

import { container } from "./app/dependencies/dependencies-container.js";
import Flows from "./app/flows/flows.js";

//normaliza instâncias dos serviços
const gitService = container.gitService;
const gitAuthService = container.gitAuthService
const githubService = container.githubService
const flows = new Flows(gitService, githubService, gitAuthService)

//fluxos
const initialConfig = flows.initialConfig
const updateRemoteBranchFlow = flows.updateRemoteBranch
const fillPrTemplateFlow = flows.fillPrTemplate
const createPrFlow = flows.createPullRequest

const main = async () => {
  try {
    
    //configurações iniciais
    initialConfig()

    //fluxo de update branch remota
    const dataRemoteRepo = await updateRemoteBranchFlow()

    //executa fluxo que preenche os dados do arquivo pr
    const filledPrTemplate = await fillPrTemplateFlow(dataRemoteRepo)

    //fluxo que cria a pr
    await createPrFlow(dataRemoteRepo, filledPrTemplate)
    

  } catch (err) {
    if (err instanceof Error) console.log(err.message)
      return
  }
};

await main();
