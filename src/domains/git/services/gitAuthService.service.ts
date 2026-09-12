import GitAuthServiceInterface from "../models/interfaces/gitAuthService.interface.js";
import GitCredentialInterface from "../models/interfaces/gitCredential.interface.js";
import { execFileSync } from "node:child_process";

class GitAuthService implements GitAuthServiceInterface {

  getCredential(protocol: string, host: string): GitCredentialInterface {
    const input = `protocol=${protocol}\n` + `host=${host}\n` + "\n";

    const output = execFileSync("git", ["credential", "fill"], {
      input,
      encoding: "utf-8",
    });

    const username = this.extractValue(output, "username")
    const password = this.extractValue(output, "password")

    if(!username || !password) throw new Error(`Não foram encontradas credenciais válidas para ${host}`)

    return {username, password};
  }

  private extractValue(output: string, key: string): string | null {
    const line = output
                    .split(/\r?\n/)
                    .find(line => line.startsWith(`${key}=`))

    if(!line) return null
    return line.split('=')[1].trim()
  }
}

export default GitAuthService;
