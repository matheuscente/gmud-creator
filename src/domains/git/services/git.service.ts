import { execSync } from "child_process";
import { execFileSync } from "child_process";
import type GitServiceInterface from "../models/interfaces/git.service.interface.ts"
import repoInfoDTO from "../models/interfaces/DTOs/repoInfo.DTO.js";

class GitService implements GitServiceInterface{

  getPathProject = (): string => {
    return execSync('git rev-parse --show-toplevel').toString().trim()
  };
  
  addSafeDirectory = (pathProject: string): void => {
    execSync(`git config --global --add safe.directory ${pathProject}`);
  };

  getGitRemoteRepositoryLink = (remoteRepoName: string): string => {
    return execSync(`git remote get-url ${remoteRepoName}`).toString().trim();
  };

  getRepoInfo =(remoteRepoLink: string): repoInfoDTO => {
    const match = remoteRepoLink.match(
      /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
    );

    if (!match) {
      throw new Error(`Remote GitHub inválido: ${remoteRepoLink}`);
    }

    return {
      owner: match[1],
      repo: match[2]
    }

  }

  getCurrentBranch = (): string => {
    return execSync("git branch --show-current").toString().trim();
  };

  getRemoteRepoName = (): string[] => { 
    const output =  execFileSync('git', ['remote']).toString().trim()
    return output.split(/\r?\n/)
   }


  pushLocalBrachToRemoteBranch = ( remoteRepoName: string, localBranchName: string): string => {
    return execFileSync("git", ["push", remoteRepoName, `${localBranchName}`]).toString()
  }

}

export default GitService;
