import GitService from "../../domains/git/services/git.service.js";
import GithubService from "../../domains/github/services/github.service.js";
import GetTemplate from "../../domains/github/interfaces/getTemplate.interface.js";
import GitAuthService from "../../domains/git/services/gitAuthService.service.js";
import { Octokit } from "@octokit/rest";
import {createInterface} from 'node:readline/promises';
import DataTemplatePr from "./interfaces/dataTemplatePr.interface.js";
import Actions from "./interfaces/actions.type.js";


class Flows {
  constructor(
    private gitService: GitService,
    private githubService: GithubService,
    private gitAuthService: GitAuthService
  ) {}

  updateRemoteBranch = async (): Promise<string> => {
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
    return this.gitService.pushLocalBrachToRemoteBranch(remoteRepoName, localBrach);
  };

  fillPrTemplate = async () => {
    //obtem o template
    const argumentsGetTemplate: GetTemplate = {
      owner: "vexur-startup",
      repo: ".github",
      path: ".github/PULL_REQUEST_TEMPLATE.md",
      ref: "main"
    }

    const remoteBranchName = this.gitService.getCurrentBranch()
    const action = this.getAction(remoteBranchName)

    const prTemplate = await this.githubService.getPRTemplate(argumentsGetTemplate)
    const rl = createInterface({input: process.stdin, output: process.stdout})

    try {
      const summaryChange = await rl.question('descreva o resumo da mudança: ')
      const mondayTask = await rl.question('link da tarefa monday: ')

      const templateAtualizado = this.fillTemplate({
        action: action,
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

 private getAction = (branchName: string): Actions => {
  const actions: Actions[] = ["feat", "fix", "hotfix", "infra", "refactor"]
  
  let action = branchName.split("-")

  let isValidAction = actions.includes((action[0]) as Actions)

  if(!isValidAction) {
    action = branchName.split("(")
  }

  isValidAction = actions.includes((action[0]) as Actions)


  if(!isValidAction) throw new Error("ação de mudança inválida, verifique nome da branch")

   return action[0] as Actions
 }
}

export default Flows;
