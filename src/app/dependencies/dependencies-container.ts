import GitService from "../../domains/git/services/git.service.js";
import GitAuthService from "../../domains/git/services/gitAuthService.service.js";
import GithubService from "../../domains/github/services/github.service.js";
import ConfigService from "../configs/services/config.service.js";

class DependenciesContainer {

//git services
gitService = new GitService()
gitAuthService = new GitAuthService()

//github services
githubService = new GithubService()

configService = new ConfigService()
}

export const container = new DependenciesContainer()