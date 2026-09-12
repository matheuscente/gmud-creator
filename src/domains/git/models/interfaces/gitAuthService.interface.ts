import GitCredentialInterface from "./gitCredential.interface.js";

interface GitAuthServiceInterface {
    getCredential(protocol: string, host: string): GitCredentialInterface
}

export default GitAuthServiceInterface