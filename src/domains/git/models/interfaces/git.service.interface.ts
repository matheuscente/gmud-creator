import repoInfoDTO from "./DTOs/repoInfo.DTO.js"

interface GitServiceInterface {
     addSafeDirectory(pathProject: string): void,
    
      getGitRemoteRepositoryLink(remoteRepoName: string): string,
    
      getCurrentBranch(): string,

      getRepoInfo(remoteRepoLink: string): repoInfoDTO

      getPathProject(): string
}

export default GitServiceInterface