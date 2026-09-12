interface GithubRepoDTO {
  id: number,
  name: string,
  owner: {
    name?: string | null | undefined
  },
  url: string,
  private: boolean
}

export default GithubRepoDTO