# gENSP.A.R.K Host Bridge

The developer environment intentionally stores no GitHub token, shell credential, or deployment secret in browser JavaScript.

Privileged actions are requested from an authorized outer host through DOM events.

## Request event

The UI emits a CustomEvent named "genspark:tool-request".

Its detail contains:
- id
- tool
- args
- repo
- branch

Current request names include:
- developer.task
- repo.scan
- tests.run
- diff.review

A desktop wrapper, local dev server, ChatGPT-connected workflow, or another authorized host may listen for these events and execute the corresponding real tool.

## Result event

The host returns a CustomEvent named "genspark:tool-result".

The result may include:
- tool
- status
- mode
- summary
- projectMap
- diff
- trace

The same result can be injected directly through window.gensparkDev.receiveToolResult(result).

## Security boundary

The browser surface may maintain project maps and task traces, visualize coding states, store local non-secret project memory, display diffs and test results, and request work.

The authorized host may read and write repository files, create branches and commits, execute shell commands, run tests and builds, inspect browser/runtime behavior, deploy, and return evidence.

This separation makes gENSP.A.R.K visibly present in the coding workflow without embedding long-lived credentials in a static page.
