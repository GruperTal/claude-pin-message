import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Pin } from '../types'

const PANE = 'pins'
const pins = atom({ plugin: 'pin-message', key: 'pins' } as const, [])

// ponytail: Markdown takes 10000 chars and no control characters but tab and
// newline, so a longer pin is cut; page it across several elements if that bites.
const clean = (text: string) =>
  text
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 10000)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'pin',
      description: "Pin the selected text, or Claude's last response, to a side pane",
    })
    await $.command.register({
      name: 'unpin',
      description: 'Remove every pin and close the pane',
    })

    return next(e)
  })

  on('command.run', { command: 'pin' }, async $ => {
    const selected = clean((await $.ui.selection())?.text ?? '')
    const messages = await $.session.messages()
    const replies = Array.isArray(messages)
      ? messages.filter(one => one.role === 'assistant' && one.text.trim() !== '')
      : []
    const text = selected || clean(replies.at(-1)?.text ?? '')

    if (text === '') {
      return { text: 'Nothing to pin: no selection and no response yet.' }
    }

    // Selected text is what the screen showed, already rendered: drawn as is.
    const pin: Pin = { text, isMarkdown: selected === '' }
    await update($, pins, list =>
      list.some(one => one.text === text) ? list : [...list, pin],
    )
    const opened = await $.ui.open({ id: PANE, title: 'Pinned' })

    return {
      text: opened.isPlaced
        ? `Pinned ${selected === '' ? "Claude's last response" : 'the selection'}.`
        : `Pinned, but the pane is not shown: ${opened.reason}`,
    }
  })

  on('command.run', { command: 'unpin' }, async $ => {
    await update($, pins, () => [])
    await $.ui.close({ id: PANE })

    return { text: 'Unpinned everything.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Markdown, Text } = $.ui.resolve(e)
    const list = await read($, pins)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>Nothing pinned. Run /pin.</Text>}
        {list.map((pin, index) => (
          <Box flexDirection="column" marginBottom={1}>
            <Button
              key={`unpin:${index}`}
              plain
              dimColor
              label="✕ unpin"
              onPress={() =>
                update($, pins, all => all.filter(one => one.text !== pin.text))
              }
            />
            {pin.isMarkdown ? (
              <Markdown text={pin.text} />
            ) : (
              <Text>{pin.text}</Text>
            )}
          </Box>
        ))}
      </Box>
    )
  })
}
