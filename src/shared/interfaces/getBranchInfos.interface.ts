import Actions from "../../app/flows/interfaces/actions.type.js";

interface GetBranchInfos {
    action: Actions,
    remoteBranch: string,
    board: string,
    task: string,
    title: string
}

export default GetBranchInfos