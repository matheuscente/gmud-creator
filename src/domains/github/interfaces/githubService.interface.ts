import { Octokit } from "@octokit/rest"
import GithubUserDTO from "../DTOs/githubUser.dto.js"
import repoInfoDTO from "../../git/models/interfaces/DTOs/repoInfo.DTO.js"
import GithubRemoteRepoBranch from "../DTOs/githubRemoteBranch.DTO.js"
import GithubRepoDTO from "../DTOs/githubRepo.DTO.js"
import GetTemplate from "./getTemplate.interface.js"

interface GithubServiceInterface {
    getUser(): Promise<GithubUserDTO> 
    setOctokit(octokit: Octokit): void
    // getRemoteBranch(data: repoInfoDTO, localBranchName: string): Promise<GithubRemoteRepoBranch | undefined>
    getGithubRemoteRepo(data: repoInfoDTO): Promise<GithubRepoDTO>
    getPRTemplate(data: GetTemplate): Promise<string>
}

export default GithubServiceInterface