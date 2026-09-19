import { execSync } from "child_process";
import { execFileSync } from "child_process";
import type GitServiceInterface from "../models/interfaces/git.service.interface.ts"
import repoInfoDTO from "../models/interfaces/DTOs/repoInfo.DTO.js";
import Actions from "../../../app/flows/interfaces/actions.type.js";
import GetBranchInfos from "../../../shared/interfaces/getBranchInfos.interface.js";

class GitService implements GitServiceInterface {
  getPathProject = (): string => {
    return execSync("git rev-parse --show-toplevel").toString().trim();
  };

  addSafeDirectory = (pathProject: string): void => {
    execSync(`git config --global --add safe.directory ${pathProject}`);
  };

  getGitRemoteRepositoryLink = (remoteRepoName: string): string => {
    return execSync(`git remote get-url ${remoteRepoName}`).toString().trim();
  };

  getRepoInfo = (remoteRepoLink: string): repoInfoDTO => {
    const match = remoteRepoLink.match(
      /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
    );

    if (!match) {
      throw new Error(`Remote GitHub inválido: ${remoteRepoLink}`);
    }

    return {
      owner: match[1],
      repo: match[2],
    };
  };

  getCurrentBranch = (): string => {
    return execSync("git branch --show-current").toString().trim();
  };

  getRemoteRepoName = (): string[] => {
    const output = execFileSync("git", ["remote"]).toString().trim();
    return output.split(/\r?\n/);
  };

  pushLocalBrachToRemoteBranch = (
    remoteRepoName: string,
    localBranchName: string,
  ): string => {
    return execFileSync("git", [
      "push",
      remoteRepoName,
      `${localBranchName}`,
    ]).toString();
  };

  getRemoteBranches(remoteRepoName: string): string[] {
    const output = execFileSync("git", ["branch", "-r"]).toString();

    const array = output
      .split(/\r?\n/)

    return array.filter((item) => item.trim().startsWith(remoteRepoName));
  }

  getBranchInfos = (
    branchName: string,
    remoteRepoName: string,
  ): GetBranchInfos => {
    const actions: Actions[] = ["feat", "fix", "hotfix", "infra", "refactor"];

    let action = branchName.split(/([()])/);

    let isValidAction = actions.includes(action[0] as Actions);

    if (!isValidAction) {
      
    }

    const remoteBranches = this.getRemoteBranches(remoteRepoName);

      const isValidRemoteRepo = remoteBranches.find((item) =>
        item.includes(action[2]),
      );

      if (!isValidRemoteRepo) throw new Error("repo remoto invalido, verifique nome da branch");

      const branchInfos = action[action.length - 1].split('-')

      const board = branchInfos.find(item => item.toLowerCase().startsWith('b'))
      const task = branchInfos.find(item => item.toLowerCase().startsWith('t'))

      if(!board || !task) throw new Error("tarefa ou quadro não encontrado, verifique a branch") 

      const title = `[VEXUR] ${branchInfos.filter(item => item !== board || item !== task).join(" ").replace("-", "")}`

      if(!title) throw new Error("descrição da branch inválida!")


      return {
        action: action[0] as Actions,
        remoteBranch: action[2],
        board: board,
        task: task,
        title: title,
      }


      ;


    //   if(!isValidAction) {
    //     action = branchName.split("(")
    //   }

    //   isValidAction = actions.includes((action[0]) as Actions)

    //   if(!isValidAction) throw new Error("ação de mudança inválida, verifique nome da branch")

    //    return action[0] as Actions
    //  }
  };
}

export default GitService;
