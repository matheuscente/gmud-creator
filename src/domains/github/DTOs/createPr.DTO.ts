export interface CreatePullRequestDTO {
    owner: string
    repo: string
    title: string
    head: string
    base: string
    body: string
}

export default CreatePullRequestDTO