import { createInterface } from "readline/promises";
import GitService from "../../domains/git/services/git.service.js";

class Flows {
  createRemoteBranch = async (gitService: GitService) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      //seta pasta do projeto como repo seguro no git
      const pathProject = gitService.getPathProject();
      gitService.addSafeDirectory(pathProject);

      //obtem branch local
      const localBrach = gitService.getCurrentBranch();

      //obtem os nomes dos repos remoto
      const nomesRepoRemoto = gitService.getRemoteRepoName();
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
    return gitService.pushLocalBrachToRemoteBranch(remoteRepoName, localBrach);
  };
}

export default Flows;
