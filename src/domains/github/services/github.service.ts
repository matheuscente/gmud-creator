import { Octokit } from "@octokit/rest";
import GithubServiceInterface from "../interfaces/githubService.interface.js";
import GithubUserDTO from "../DTOs/githubUser.dto.js";
import repoInfoDTO from "../../git/models/interfaces/DTOs/repoInfo.DTO.js";
import GithubRepoDTO from "../DTOs/githubRepo.DTO.js";
import GithubRemoteRepoBranch from "../DTOs/githubRemoteBranch.DTO.js";
import GetTemplate from "../interfaces/getTemplate.interface.js";
import CreatePullRequestDTO from "../DTOs/createPr.DTO.js";

class GithubService implements GithubServiceInterface {
  constructor(private octokit?: Octokit) {}

  getPRTemplate(data: GetTemplate): Promise<string> {

    return this.execute<string>(async (octokit) => {
      const response = await octokit.rest.repos.getContent({...data})

      if(Array.isArray(response.data)) throw new Error("O caminho informado não é um arquivo")

      if(response.data.type != 'file') throw new Error("O conteúdo encontrado não é um arquivo")

      return Buffer.from(response.data.content, "base64").toString()
    })
  }

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

   async createPr(data: CreatePullRequestDTO) {
    return this.execute<unknown>(async (octokit) => {
      const pr = await octokit.rest.pulls.create({...data})
      return pr
    })
   }
}

export default GithubService;
