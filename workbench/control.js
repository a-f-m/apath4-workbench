
// ################### debugging ###############################

var debug_state = 'init'
var debug_channel = new window.Channel_.BoundedChannel(100)
var decorations
var last = {}
var curr_ast
var func_no_to_expr = []
var breakpoints = []
var breakpoint_decorations
var final_result





function set_docorations(loc, kind) {

    let decos = []
    if (loc === null) {
        if (decorations) decorations.clear()
    } else {
        if (decorations) decorations.clear()
        decos = [
            {
                range: new monaco.Range(loc.start.line, loc.start.column, loc.end.line, loc.end.column),
                options: {
                    overviewRulerColor: 'red',
                    inlineClassName: kind === 'pre' ? 'inlineDecorationPre' : 'inlineDecorationPost',

                    // playing with brakets ;)

                    // before: { content: '\u27EA' },
                    // after: { content: '\u27EB' }
                    // before: { content: '\u29FC\u29FC' },
                    // after: { content: '\u29FD' }
                    // before: { content: '\u276E\u276E' },
                    // after: { content: '\u276F' }
                    // before: { content: '\u2770' },
                    // after: { content: '\u2771' }
                    // before: { content: '\u27EA \u29FC \u276E \u2770' }
                    // before: { content: '\u29FC' }
                    // before: { content: '\u2770' },
                    // after: { content: '\u2771' }
                },
            },
        ]
        decorations = monaco_editors['apath'].createDecorationsCollection(decos)
    }
}

function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}

// -----------------------------------------------------------------

async function debug_callback(debug_data) {

    func_no_to_expr = debug_data.env.func_no_to_expr
    curr_ast = func_no_to_expr[0]

    await debug_channel.send(debug_data)
}

function visibility_wb(b) {
    $('#fset_examples, #fset_widgets, #fset_control').prop('disabled', !b)
    // set_editor_ro(!b)
}

function set_editor_ro(b) {
    monaco_editors.input.updateOptions({ readOnly: b })
    monaco_editors.apath.updateOptions({ readOnly: b })
}

function visibility_debug_control(b) {
    $('#bnt_run, #bnt_step, #bnt_restart, #bnt_step_over, #bnt_stop').prop('disabled', !b)
    $('.debug-frame, .debug-frame img').css('opacity', b ? '1' : '0.5')
    $('.debug-frame, .debug-frame img').css('cursor', b ? 'pointer' : 'auto')
}

async function set_debug_state(next_state) {

    if (next_state.match('^start$')) {

        debug_channel = new window.Channel_.BoundedChannel(100)
        console.log('Konsument reset.')
        last = {}
        set_docorations(null)
        visibility_wb(false)
        visibility_debug_control(true)

        final_result = await complete_eval()
        await monaco_editors.result.setValue('')


    } if (next_state.match('^init$')) {

        set_docorations(null)
        visibility_wb(true)
        visibility_debug_control(false)

        punch_to_result('final result:\n' + final_result, false)        
    }

    debug_state = next_state
}

$('#bnt_start').on('click', async function () {
    await set_debug_state('start')
})

function onApathDidChangeCursorPosition(e) {
}

$('#bnt_run').on('click', async function () {
    await proceed(false)
})

// $('#bnt_run_to_cursor').on('click', async function () {
//     await proceed(false)
// })

$('#bnt_step').on('click', async function () {
    await proceed(true)
})

$('#bnt_restart').on('click', async function () {
    await set_debug_state('init')
    await set_debug_state('start')
    await proceed(false)
})

$('#bnt_stop').on('click', async function () {
    await set_debug_state('init')
})

async function proceed(only_one_step) {

    let stop_it = false
    let debug_data
    while (!stop_it) {
        debug_data = await debug_channel.receive(true)
        if (debug_data === null) {
            await set_debug_state('init')
            stop_it = true
            break
        }
        let d
        ({ d, debug_data } = await ignore_same_locs(debug_data))
        if (debug_data === null) continue // ensures the above stop_it
        last = d

        if (only_one_step) break

        if (breakpoints.includes(debug_data.func_no)) break

        if (debug_data.kind === 'pre' && $('#toggle_halt_on_pre').prop('checked')) break
        if (debug_data.kind === 'post' && $('#toggle_halt_on_post').prop('checked')) break

    }
    if (!stop_it) {
        debug_log(debug_data)
        set_docorations(debug_data.loc, debug_data.kind)
    }
}

function debug_log(debug_data) {

    const mess = `send ${debug_data.kind} fno: ${debug_data.func_no} res: ${debug_data.result} type: ${debug_data.expr?.type}`
    console.log(mess)

    const txt = step_log(debug_data)
    punch_to_result(txt, true)
}

function punch_to_result(txt, to_last_line) {

    const previous_txt = monaco_editors.result.getValue()
    monaco_editors.result.setValue(previous_txt + txt)
    if (to_last_line) {
        const lastLine = monaco_editors.result.getModel().getLineCount()
        monaco_editors.result.revealLineInCenter(lastLine)
    }
}

function step_log(debug_data) {

    const kind = debug_data.kind === 'pre' ? 'enter' : 'leaving'
    const ctx = window.Utils_.shortenString(JSON.stringify(debug_data.ctx_node), 80)
    const result = debug_data.result ? `\nresult:\n` + window.Utils_.shortenString(JSON.stringify(debug_data.result), 80) : ''

return `${kind} expression
context node:
${ctx}${result}
------
`
}

async function ignore_same_locs(debug_data) {

    let d = { kind: debug_data.kind, loc: debug_data.loc }
    while (deepEqual(last, d)) {
        debug_data = await debug_channel.receive(true)
        if (debug_data === null) return { d, debug_data: null }
        d = { kind: debug_data.kind, loc: debug_data.loc }
    }
    return { d, debug_data }
}

function deco_breakpoints() {

    let decos = []
    if (breakpoint_decorations) breakpoint_decorations.clear()
    for (const func_no of breakpoints) {

        const floc = func_no_to_expr[func_no].loc
        decos.push({
            range: new monaco.Range(floc.start.line, floc.start.column, floc.end.line, floc.end.column),
            options: {
                before: { content: '\u2770', inlineClassName: 'inlineDecorationBreakpoint' },
                after: { content: '\u2771', inlineClassName: 'inlineDecorationBreakpoint' }
            }
        })
    }
    breakpoint_decorations = monaco_editors['apath'].createDecorationsCollection(decos)
}

function remove_breakpoints() {
    breakpoints = []
    deco_breakpoints()    
}

function toggle_breakpoint(fno) {

    if (!breakpoints.find(x => x === fno)) {
        breakpoints.push(fno)
    } else {
        breakpoints = breakpoints.filter(x => x !== fno)
    }
    deco_breakpoints()
}


$('#bnt_set_break').on('click', async function () {

    let p = monaco_editors['apath'].getPosition()
    const func_no = window.Adt_.determ_func_no(curr_ast, monaco_editors.apath.getValue(), { line: p.lineNumber, column: p.column })
    if (func_no === -1) return
    toggle_breakpoint(func_no)
    console.log(func_no + ', ' + func_no_to_expr[func_no].type)
})

$('#bnt_remove_all_break').on('click', async function () {
    remove_breakpoints()
    console.log(breakpoints)
})

