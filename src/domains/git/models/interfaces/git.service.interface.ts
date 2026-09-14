import repoInfoDTO from "./DTOs/repoInfo.DTO.js"

interface GitServiceInterface {
  getPathProject(): string
  
  addSafeDirectory(pathProject: string): void

  getGitRemoteRepositoryLink(remoteRepoName: string): string

  getRepoInfo(remoteRepoLink: string): repoInfoDTO
    
  getCurrentBranch(): string
  
  getRemoteRepoName(): string[]
  
  pushLocalBrachToRemoteBranch( remoteRepoName: string, localBranchName: string): string

}

export default GitServiceInterface