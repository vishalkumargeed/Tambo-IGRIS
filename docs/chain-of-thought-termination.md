# Chain-of-Thought Termination (GitHub MCP multi-PR reviews)

When the AI acknowledges the next task (e.g. "pacing briefly before starting the next PR") but then stops instead of calling the GitHub MCP again, that’s often **Chain-of-Thought Termination**: the stream ends after one tool round.

## What we did in this app

### 1. **"Continue" strip (frontend keep-alive)**

- **Where:** Above the message input in the Tambo chat.
- **When:** Shown when the thread is idle and the last assistant message contains phrases like "pacing", "next PR", "remaining PRs", etc.
- **Action:** Click **Continue** to send: *"Please continue reviewing the remaining PRs one by one using the GitHub MCP..."* so the agent continues with the next PR(s) without you retyping.

### 2. **Elicitation visibility**

- If the AI is waiting for a **hidden elicitation** (e.g. confirmation), the input area is replaced by the **ElicitationUI** (form / buttons). If you don’t see the normal text box, check for a small form or "Proceed?"-style controls and complete them so the thread can continue.

### 3. **System prompt**

- The system prompt tells the model to **not** stop after one PR when reviewing multiple PRs, and to treat a user "Continue" message as "proceed with the remaining PRs."

## What to check in Tambo (backend / dashboard)

The **React SDK already supports multi-step tool use**: after each tool response it calls `advanceStream` again. If the stream still ends after one PR, the limit is likely on the **Tambo backend** (project/agent config), not in this repo.

- In the **Tambo dashboard** (or project/agent settings), look for:
  - **Agent / multi-step execution** (e.g. "agent mode", "continue after tool calls").
  - **maxSteps**, **recursionLimit**, or similar (if your Tambo version exposes them).
- Enabling multi-step / higher step limits there should let the model keep calling the GitHub MCP until all PRs are reviewed, instead of stopping after the first tool round.

Until that’s enabled, use the **Continue** button in the UI to advance to the next PR(s) after each stop.
