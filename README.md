# Claude Pin Message

A Claude Code mod that pins a response beside the conversation, so the plan, the command or the answer you keep scrolling back to stays on screen while the session goes on.

```
 ❯ what's the rollout plan?                │ ✕ unpin
 ● 1. Ship behind a flag                   │ 1. Ship behind a flag
   2. Canary at 5%                         │ 2. Canary at 5%
   3. Full rollout Thursday                │ 3. Full rollout Thursday
 ❯ /pin                                    │
 ❯ ok, start with step 1                   │ ✕ unpin
 ● Adding the flag...                      │ npm run deploy -- --canary
   (the conversation keeps scrolling)      │
```

## Install

Inside Claude Code, run:

```
/plugin marketplace add GruperTal/claude-pin-message
/plugin install pin-message@claude-pin-message
/reload-plugins
```

## Use

| You do | What happens |
| --- | --- |
| Select text with the mouse, then `/pin` | The selection is pinned |
| `/pin` with nothing selected | Claude's last response is pinned, drawn as markdown |
| Press `✕ unpin` above a pin | That pin is removed |
| `/unpin` | Every pin is removed and the pane closes |

Pin as many things as you like; they stack in one "Pinned" pane. Close the pane and your pins are kept: the next `/pin` brings it back.

## Good to know

- **Selections need the fullscreen layout.** Claude Code only reports a mouse selection there. Elsewhere `/pin` pins the last response, and the pane sits above the prompt instead of beside the transcript.
- **Pins last for the session.** A new session starts with none.
- **A pin holds up to 10,000 characters.** A longer one is cut.

## How it works

It is a [mod](https://code.claude.com/docs/en/plugins/mods/overview): one hooks module, about 90 lines, in `hooks/register.tsx`. `/pin` reads the selection and the session's messages, keeps the text in session state, and opens a pane that draws the pins.

It is local-only: no network requests, no files written, no model calls. Run `claude plugin validate` on the repo to see every event it hooks and every call it makes.

## Requirements

Claude Code with mods support. Built and tested on v2.1.289.

## Development

```bash
claude --plugin-dir .      # run it from a checkout
claude plugin validate .
claude plugin test .
```

## License

[MIT](LICENSE)
