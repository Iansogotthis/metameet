# gENSP.A.R.K Developer Environment

This directory is the first executable Coder Core surface for gENSP.A.R.K.

## Run

From this directory:

    npm test
    npm run dev

Then open http://localhost:4173.

In GitHub Codespaces or a compatible dev container, port 4173 is forwarded automatically.

## What is real in v1

- animated SCAN / BUILD / DEBUG / TEST / AUDIT / SHIP states;
- persistent browser project map and code-trace memory;
- task intake using the Coder Core operating cycle;
- diff counting and review surface;
- local self-tests;
- browser preview target;
- credential-free host bridge for authorized repository, terminal, test, browser, and deployment actions;
- GitHub Actions checks on pushes and pull requests;
- VS Code tasks for verify and run.

## Security model

The browser does not carry GitHub tokens or shell credentials. Privileged actions belong to an authorized host such as a desktop wrapper, local development server, connected ChatGPT workflow, or future authenticated service.

See HOST_BRIDGE.md and CODER_CORE.md.
