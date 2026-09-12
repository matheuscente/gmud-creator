#!/usr/bin/env node

import { createInterface } from "readline/promises";
import { container } from "./app/dependencies/dependencies-container.js";
import process from "process";
import { Octokit } from "@octokit/rest";

//normaliza instâncias dos serviços
const gitService = container.gitService;

const main = async () => {
  try {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

   //seta pasta do projeto como repo seguro no git
  const pathProject = gitService.getPathProject();
  gitService.addSafeDirectory(pathProject);

  //obtem branch local
  const localBrach = gitService.getCurrentBranch()

  //obtem os nomes dos repos remoto
  const nomesRepoRemoto = gitService.getRemoteRepoName()
  let remoteRepoName: string = nomesRepoRemoto.length === 1 ? nomesRepoRemoto[0] : ""

  if(nomesRepoRemoto.length > 1) {
      remoteRepoName = await rl.question(`repos encontrados: ${nomesRepoRemoto}. Qual usar?`)
    } else if(nomesRepoRemoto.length === 1 && nomesRepoRemoto[0].length === 0) {
      rl.close()
      throw new Error("Não foram encontrados repositórios remotos, por gentileza, cadastre 1 e tente novamente.")
    }

    gitService.pushLocalBrachToRemoteBranch(remoteRepoName, localBrach)

    rl.close()
    return

  } catch (err) {
    if (err instanceof Error) console.log(err.message)
      return
  }

  //  const changeDetails = await rl.question("Informe os detalhes da mudança: ")

  //  console.log(`

  //    MUDANÇA CRIADA COM SUCESSO!

  //     branch: ${branch}

  //     fixes: ${changeDetails}

  //     link repo: ${remoteRepository}

  //     repo: ${repo}
  //     `)

  //     rl.close()

  return
};

await main();
