import GitService from "../../domains/git/services/git.service.js";
import GithubService from "../../domains/github/services/github.service.js";
import GetTemplate from "../../domains/github/interfaces/getTemplate.interface.js";
import GitAuthService from "../../domains/git/services/gitAuthService.service.js";
import { Octokit } from "@octokit/rest";
import {createInterface} from 'node:readline/promises';
import DataTemplatePr from "./interfaces/dataTemplatePr.interface.js";
import Actions from "./interfaces/actions.type.js";
import CreatePullRequestDTO from "../../domains/github/DTOs/createPr.DTO.js";
import RemoteRepoData from "../../shared/interfaces/remoteRepoData.interface.js";


class Flows {
  constructor(
    private gitService: GitService,
    private githubService: GithubService,
    private gitAuthService: GitAuthService
  ) {}

  //este fluxo retorna o nome repo remoto
  updateRemoteBranch = async (): Promise<RemoteRepoData> => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      //obtem branch local
      const localBrach = this.gitService.getCurrentBranch();

      //obtem os nomes dos repos remoto
      const nomesRepoRemoto = this.gitService.getRemoteRepoName();
      let remoteRepoName: string =
        nomesRepoRemoto.length === 1 ? nomesRepoRemoto[0] : "";

      if (nomesRepoRemoto.length > 1) {
        remoteRepoName = await rl.question(
          `repos encontrados: ${nomesRepoRemoto}. Qual usar?`,
        );
      } else if (
        nomesRepoRemoto.length === 1 &&
        nomesRepoRemoto[0].length === 0
      ) {
        rl.close();
        throw new Error(
          "Não foram encontrados repositórios remotos, por gentileza, cadastre 1 e tente novamente.",
        );
      }

      if (!nomesRepoRemoto.includes(remoteRepoName)) {
        rl.close();
        throw new Error(
          `O repositório remoto "${remoteRepoName}" não foi encontrado.`,
        );
      }

    rl.close();
    this.gitService.pushLocalBrachToRemoteBranch(remoteRepoName, localBrach);
    return {
              remoteRepoName,
              branch: localBrach
            }
    
  };

  fillPrTemplate = async (dataRemoteRepo: RemoteRepoData) => {
    //obtem o template
    const argumentsGetTemplate: GetTemplate = {
      owner: "vexur-startup",
      repo: ".github",
      path: ".github/PULL_REQUEST_TEMPLATE.md",
      ref: "main"
    }

    const actions = this.gitService.getBranchInfos(dataRemoteRepo.branch, dataRemoteRepo.remoteRepoName)

    const prTemplate = await this.githubService.getPRTemplate(argumentsGetTemplate)
    const rl = createInterface({input: process.stdin, output: process.stdout})

    try {
      const summaryChange = await rl.question('descreva o resumo da mudança: ')
      const mondayTask = await rl.question('link da tarefa monday: ')

      const templateAtualizado = this.fillTemplate({
        action: actions.action,
        change: summaryChange,
        mondayURL: mondayTask
      }, prTemplate)

      return templateAtualizado
    }
    finally {
      rl.close()
    }
  }

  initialConfig = () => {
    //seta pasta do projeto como repo seguro no git
      const pathProject = this.gitService.getPathProject();
      this.gitService.addSafeDirectory(pathProject);

    //obtem a crdencial do git com github
    const {password} = this.gitAuthService.getCredential("https", "github.com")

    //cria e seta o octokit
    const octokit = new Octokit({
      auth: password
    })
    this.githubService.setOctokit(octokit)
  }

  createPullRequest = async (remoteRepo: RemoteRepoData, filledPrTemplate: string) => {
    const RemoteRepoLink = this.gitService.getGitRemoteRepositoryLink(remoteRepo.remoteRepoName)
    const remoteRepoInfos = this.gitService.getRepoInfo(RemoteRepoLink)
    const branchInfos = this.gitService.getBranchInfos(remoteRepo.branch, remoteRepo.remoteRepoName)
        
    const data:CreatePullRequestDTO = {
      owner: remoteRepoInfos.owner,
      repo: remoteRepoInfos.repo,
      title: branchInfos.title,
      head: remoteRepo.branch,
      base: branchInfos.remoteBranch,
      body: filledPrTemplate
    }


    const pr = await this.githubService.createPr(data)

    console.log(pr)


  }

 private fillTemplate = (data: DataTemplatePr, template: string): string => {
   template = template.replace("descrever resumo da mudança.", data.change)
   template = template.replace("https://vexur-company.monday.com/boards/[BOARD_ID]/pulses/[TASK_ID]", data.mondayURL)

   switch(data.action) {
     case "feat": {
      template = template.replace("[ ] Feature", "[x] Feature")
      break
     }

     case "fix": {
      template = template.replace("[ ] Fix", "[x] Fix")
      break
     }

     case "hotfix": {
      template = template.replace("[ ] Hotfix", "[x] Hotfix")
      break
     }

     case "refactor": {
      template = template.replace("[ ] Refactor", "[x] Refactor")
      break
     }

     case "infra": {
      template = template.replace("[ ] Infra", "[x] Infra")
      break
     }

     default: {
      throw new Error("ação de mudança inválida, verifique nome da branch")
     }
   }
   
   return template
 }

 
}

export default Flows;
