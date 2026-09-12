import { Octokit } from "@octokit/rest";
import GithubServiceInterface from "../interfaces/githubService.interface.js";
import GithubUserDTO from "../DTOs/githubUser.dto.js";
import repoInfoDTO from "../../git/models/interfaces/DTOs/repoInfo.DTO.js";
import GithubRepoDTO from "../DTOs/githubRepo.DTO.js";
import GithubRemoteRepoBranch from "../DTOs/githubRemoteBranch.DTO.js";

class GithubService implements GithubServiceInterface {
  constructor(private octokit?: Octokit) {}

  setOctokit(octokit: Octokit) {
    this.octokit = octokit;
  }

  async execute<T>(fn: (octokit: Octokit) => Promise<T>): Promise<T> {
    if (!this.octokit) {
      throw new Error("Octokit não definido!");
    }

    return fn(this.octokit);
  }

  async getUser(): Promise<GithubUserDTO> {
    return this.execute<GithubUserDTO>(async (octokit) => {
      return (await octokit.rest.users.getAuthenticated()).data;
    });
  }

async getGithubRemoteRepo(data: repoInfoDTO): Promise<GithubRepoDTO> {
    return this.execute<GithubRepoDTO>(async (octokit) => {
      const repo = (await octokit.rest.repos.get({ ...data })).data;

      return {
        id: repo.id,
        name: repo.name,
        owner: {
          name: repo.owner.name,
        },
        url: repo.url,
        private: repo.private,
      };
    });
  }

  async getRemoteBranch(data: repoInfoDTO, localBranchName: string): Promise<GithubRemoteRepoBranch | undefined> {
    return this.execute<GithubRemoteRepoBranch | undefined>(async (octokit) => {
        const hasRepo = await this.getGithubRemoteRepo(data)
        if(!hasRepo || (hasRepo && Object.keys(hasRepo).length === 0)) {
            throw new Error("Repositório remoto não encontrado")
        }

        const branches = (await octokit.rest.repos.listBranches({...data}))
          .data
          .find(branch => branch.name === localBranchName)

        if(!branches) return undefined

        return {
          name: branches.name,
          protected: branches.protected
        }
    })
  }
}

export default GithubService;
