#!/usr/bin/env node

import { createInterface } from "readline/promises";
import { container } from "./app/dependencies/dependencies-container.js";
import process from "process";
import Flows from "./app/flows/flows.js";

//normaliza instâncias dos serviços
const gitService = container.gitService;
const flows = new Flows()

const main = async () => {
  try {

    const isRemoteBranchCreated = await flows.createRemoteBranch(gitService)
    console.log(isRemoteBranchCreated)

  } catch (err) {
    if (err instanceof Error) console.log(err.message)
      return
  }
};

await main();
