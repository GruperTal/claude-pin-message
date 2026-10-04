import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'pin-message',
  component: 'Pane',
  requestId: 'pins',
  props: {
    title: 'Pinned',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const run = (command: string) => ({
  command,
  args: '',
  origin: { kind: 'composer' } as const,
  presentation: { isFullscreen: true, columns: 160 },
})

test('pins the last response, then a selection, and unpins one', async ($, on) => {
  let selection: { text: string } | undefined
  on('ui.selection', () => ({ value: selection }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('session.messages', () => ({
    value: [
      { role: 'user', text: 'plan it', toolUses: [] },
      { role: 'assistant', text: '# The plan', toolUses: [] },
      { role: 'assistant', text: '', toolUses: [] },
    ],
  }))

  for (const surface of ['terminal', 'desktop'] as const) {
    await $.command.run(run('unpin'))

    selection = undefined
    await $.command.run(run('pin'))
    await $.command.run(run('pin')) // the same text twice is one pin

    selection = { text: 'a * b * c' }
    const { text } = await $.command.run(run('pin'))
    expect(text).toBe('Pinned the selection.')

    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.findAll({ type: 'Button' })).toHaveLength(2)
    expect((await ui.find({ type: 'Markdown' }))?.props.text).toBe('# The plan')
    expect(await ui.find({ type: 'Text', text: 'a * b * c' })).toBeDefined()

    await ui.press({ key: 'unpin:0' })
    expect(await ui.findAll({ type: 'Button' })).toHaveLength(1)
    expect(await ui.find({ type: 'Markdown' })).toBeUndefined()
    await ui.unmount()
  }
})
