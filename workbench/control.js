
function test() {
    console.log('testtt')
}


// ################### debugging ###############################

class Breakpoints {

    items = []
    breakpoint_decorations_1 = undefined

    deco_store = []

    all_deact = false

    constructor(items) {
        if (items) for (const item of items) this.add(item.loc, item.expr)

        // this.deco_breakpoints_1()
    }
    
    add(loc, expr) {
        if (!this.find_item(loc)) {
            this.items.push({loc, expr, deact: false})
            this.update_view()
        }
    }
    find_item(loc) {
        return this.items.find(x => window.Adt_.equal_loc(x.loc, loc))
    }
    find_active_item(loc) {
        return this.items.find(x => window.Adt_.equal_loc(x.loc, loc) && !x.deact)
    }
    remove(loc) {
        this.items = this.items.filter(x => !window.Adt_.equal_loc(x.loc, loc))
        this.update_view()
        set_hover_decoration(null)
    }
    remove_all() {
        this.items = []
        this.update_view()
        set_hover_decoration(null)
    }
    deactivate_all() {
        for (const item of this.items) {
            item.deact = !this.all_deact
        }
        this.all_deact = !this.all_deact
        this.update_view()
    }
    deactivate_single(sloc) {
        const item = this.find_item(JSON.parse(sloc.replaceAll("_", '"')))
        item.deact = !this.all_deact
        this.update_view()
    }

    update_view() {
        if (!eval_error) this.deco_breakpoints_1()
        this.update_box()
    }

    update_box() {
        // TODO css
        // let s = '<div style="width: 100%;">'
        let s = ''
        this.process_deco(decoration => {
            const deco = this.deco_store[decoration.id]
            const loc = Breakpoints.range2loc(decoration.range)
            const sloc = JSON.stringify(loc).replaceAll('"', "_")
            // <div class="box-line" onmouseover="on_box_item_enter('${sloc}')" onmouseout="on_box_item_leave('${sloc}')">
            s += 
                `
                <div class="box-line" style="width: 100%; margin-bottom: 4px; margin-top: 0px;"
                        onmouseover="on_box_item_enter('${sloc}', this)" onmouseout="on_box_item_leave('${sloc}', this)">
                    <span class="box-item" style="float: left;">${deco.expr.type}</span>
                    <span class="box-item" style="float: right;">
                        <span>${ window.Adt_.loc2string(loc)}&nbsp;&nbsp;</span>
                        <span>
                            <img onclick="if (!$('#list_breakpoints').prop('disabled')) deactivate_single('${sloc}')"
                                style="vertical-align: bottom;" src="icons/toggle-br-activ.svg" alt="Icon">
                        </span>
                        <span>
                            <img onclick="if (!$('#list_breakpoints').prop('disabled')) remove_single('${sloc}')"
                                style="vertical-align: bottom;" src="icons/clarity--remove-line.svg" alt="Icon">
                        </span>
                    </span>
                    <div style="clear: both;"></div>
                </div>
                `
                // </div>
        })
        // s += '</div>'
        $('#list_breakpoints').html(s)
    }

    deco_breakpoints_1() {

        let decos = []
        if (this.breakpoint_decorations_1) this.breakpoint_decorations_1.clear()

        const items = ebreakpoints.items.toSorted((x, y) => {
            return (x.loc && y.loc ? window.Adt_.range(x) -  window.Adt_.range(y) : -1)
        })
        let starts = []
        for (const item of items) {
            // console.log(item.loc.start.line);
            
            let equal = true
            if (curr_debug_data) {
                // equal = window.Adt_.equal_loc(curr_debug_data.loc, item.loc)
            }
            const cl = item.deact ? 'inlineDecorationBreakpointGrey' : (equal ? 'inlineDecorationBreakpoint' : 'inlineDecorationBreakpointShadow')
            let mark = '\u25C9'
            // if (starts.find(x => window.Adt_.equal_lico(x, item.loc.start))) {
            //     mark = ''
            // } else {
            //     mark = '\u25C9'
            //     starts.push(item.loc.start)
            // }
            decos.push({
                range: this.loc2range(item.loc),
                lala: true,
                options: {
                    // before: { content: '\u2770', inlineClassName: cl, isWholeLine: false }
                    // before: { content: '\u25C9', inlineClassName: cl, isWholeLine: false }
                    before: { content: mark, inlineClassName: cl, isWholeLine: false }
                    // before: { content: '\u25B6', inlineClassName: cl, isWholeLine: false }
                    // before: { content: '', inlineClassName: cl, isWholeLine: false }
                    // ,
                    // after: { content: '\u2771', inlineClassName: cl, isWholeLine: false }
                }
            })
        }
        this.breakpoint_decorations_1 = monaco_editors['apath'].createDecorationsCollection(decos)
        //--------------------------------
        this.deco_store = []
        this.process_deco (decoration => {
            this.deco_store[decoration.id] = this.find_item(Breakpoints.range2loc(decoration.range))
        })
        //----------------------------
    }
    
    remap() {

        if (eval_error) {
            this.update_box()
            return
        }

        if (!this.breakpoint_decorations_1 || this.breakpoint_decorations_1._decorationIds.length === 0) return

        // this.locs = []
        const new_items = []

        this.process_deco(decoration => {

            const loc = Breakpoints.range2loc(decoration.range)
            const expr = window.Adt_.func_exists(func_no_to_expr, loc)
            if (expr) {
                const stored = this.deco_store[decoration.id]
                new_items.push({ loc, expr, deact: stored?.deact })
            } else {
            }
        })
        this.items = new_items
        this.update_view()
    }

    
    process_deco(f) {
        const decorations = monaco_editors['apath'].getDecorationsInRange(new monaco.Range(1, 1, 1000000, 1000000))
        decorations.forEach(decoration => {

            if (this.breakpoint_decorations_1 && this.breakpoint_decorations_1._decorationIds.includes(decoration.id)) {
                f(decoration)
            }
        })
    }

    loc2range(loc) {
        return new monaco.Range(loc.start.line, loc.start.column, loc.end.line, loc.end.column)
    }
    static range2loc(range) {
        return { start: { line: range.startLineNumber, column: range.startColumn }, 
                end: { line: range.endLineNumber, column: range.endColumn } }
    }
}

var debug_state = 'init'
var debug_channel = new window.Channel_.BoundedChannel(100)
var curr_debug_data
var break_decorations
var hover_decorations
var func_no_to_expr = []
var final_result
var eval_error

var last_eval_result = {}

var ebreakpoints = new Breakpoints()

function on_box_item_enter(sloc, elm) {
    const loc = JSON.parse(sloc.replaceAll("_", '"'))
    // console.log(loc)
    set_hover_decoration(loc)
    const p = { lineNumber: loc.start.line, column: loc.start.column }
    // monaco_editors['apath'].setPosition(p)
    monaco_editors['apath'].revealPosition(p)
    // monaco_editors['apath'].focus()

    elm.style.backgroundColor = 'beige'
}
function on_box_item_leave(loc, elm) {
    set_hover_decoration(null)    
    elm.style.backgroundColor = 'inherit'
}
function deactivate_single(sloc) {
    const item = ebreakpoints.find_item(JSON.parse(sloc.replaceAll("_", '"')))
    item.deact = !item.deact
    ebreakpoints.update_view()
}
function remove_single(sloc) {
    const loc = JSON.parse(sloc.replaceAll("_", '"'))
    ebreakpoints.remove(loc)
}


function handle_eval_success(b) {
    
    $('#list_breakpoints, .debug-frame-br button, #bnt_start').prop('disabled', !b)
    $('#list_breakpoints, .debug-frame-br, .debug-frame-br img').css('opacity', b ? '1' : '0.5')
}

function set_break_decoration(loc, kind) {

    let decos = []
    if (loc === null) {
        visibility_break_step(false)
        if (break_decorations) break_decorations.clear()
    } else {
        visibility_break_step(true)
        if (break_decorations) break_decorations.clear()
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
        break_decorations = monaco_editors['apath'].createDecorationsCollection(decos)
    }
}

function set_hover_decoration(loc) {

    let decos = []
    if (hover_decorations) hover_decorations.clear()
    if (loc === null) {
    } else {
        decos = [
            {
                range: new monaco.Range(loc.start.line, loc.start.column, loc.end.line, loc.end.column),
                options: {
                    overviewRulerColor: 'red',
                    inlineClassName: 'inlineDecorationPre',
                },
            },
        ]
        hover_decorations = monaco_editors['apath'].createDecorationsCollection(decos)
    }
}

// -----------------------------------------------------------------

async function debug_callback(debug_data) {

    await debug_channel.send(debug_data)
}

function visibility_wb(b) {
    // $('#fset_examples, #fset_widgets, #fset_control').prop('disabled', !b)
    $('#fset_examples, #bnt_restore, #bnt_store, #fset_control').prop('disabled', !b)
    // set_editor_ro(!b)
}

function set_editor_ro(b) {
    monaco_editors.input.updateOptions({ readOnly: b })
    monaco_editors.apath.updateOptions({ readOnly: b })
}

function visibility_debug_control(b) {
    $('#bnt_run, #bnt_step, #bnt_restart, #bnt_step_over, #bnt_stop').prop('disabled', !b)
    $('.debug-frame, .debug-frame img').css('opacity', b ? '1' : '0.5')
    // $('.debug-frame, .debug-frame img').css('cursor', b ? 'pointer' : 'auto')
    $('.debug-frame, .debug-frame img').css('cursor', 'pointer')
}
function visibility_break_step(b) {
    visibility_single('#bnt_set_break_step', b)
}
function visibility_single(id, b) {
    $(id).prop('disabled', !b)
    $(id).css('opacity', b ? '1' : '0.5')
    // $(id).css('cursor', b ? 'pointer' : 'auto')    
    $(id).css('cursor', 'pointer')    
}

async function set_debug_state(next_state) {

    if (next_state.match('^start$')) {

        debug_channel = new window.Channel_.BoundedChannel(100)
        console.log('Konsument reset.')
        set_break_decoration(null)
        visibility_debug_control(true)
        set_editor_ro(true)

        final_result = await complete_eval()
        await monaco_editors.result.setValue('')


    } if (next_state.match('^init$')) {

        set_break_decoration(null)
        visibility_debug_control(false)
        set_editor_ro(false)
        curr_debug_data = undefined

        punch_to_result('final result:\n' + final_result, false)        
    }
    ebreakpoints.deco_breakpoints_1()

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
        curr_debug_data = debug_data

        if (ebreakpoints.find_active_item(debug_data.expr.loc)) 
            break

        // let d
        // ({ d, debug_data } = await ignore_same_locs(debug_data))
        // if (debug_data === null) continue // ensures the above stop_it
        // last = d

        if (only_one_step) break

        if (debug_data.kind === 'pre' && $('#toggle_halt_on_pre').prop('checked')) 
            break
        if (debug_data.kind === 'post' && $('#toggle_halt_on_post').prop('checked')) 
            break

    }
    if (!stop_it) {
        debug_log(debug_data)
        set_break_decoration(debug_data.loc, debug_data.kind)
        ebreakpoints.deco_breakpoints_1()
    }
}

function debug_log(debug_data) {

    const mess = `send ${debug_data.kind} fno: ${debug_data.func_no} res: ${debug_data.result} type: ${debug_data.expr?.type} loc: ${JSON.stringify(debug_data.loc)}`
    // console.log(mess)

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
    const result = debug_data.kind === 'post' ? 
        `\nresult:\n` + window.Utils_.shortenString(prep_result(debug_data.result), 80) 
        : ''
// no-indent needed
    return `${kind} ${debug_data.expr?.type}
context node:
${ctx}${result}
------
`
}

function prep_result(r) {
    return !window.Apart_.single(r) ? 
        (r == window.Apart_.nilit || (r instanceof window.Apart_.MemorizingIter && r.size === 0) ? 'nil' : '<node iterator>') 
        : JSON.stringify(r)
}

function determ_func_expr(p) {
    // return window.Adt_.determ_func_no(curr_ast, monaco_editors.apath.getValue(), { line: p.lineNumber, column: p.column })
    return window.Adt_.determ_func_expr(func_no_to_expr, monaco_editors.apath.getValue(), { line: p.lineNumber, column: p.column })
}

function remove_breakpoints() {
    ebreakpoints.remove_all()
}

var remap_sync = new window.Channel_.SyncFlag()

function toggle_breakpoint_1(p) {

    const expr = determ_func_expr(p)
    if (expr) {

        if (!ebreakpoints.find_item(expr.loc)) {
            ebreakpoints.add(expr.loc, expr)
        } else {
            ebreakpoints.remove(expr.loc)
        }
    }
}


$('#bnt_set_break').on('click', async function () {

    toggle_breakpoint_1(monaco_editors.apath.getPosition(), monaco_editors.apath.getValue())
})

$('#bnt_remove_all_break').on('click', async function () {
    remove_breakpoints()
})

$('#bnt_set_break_step').on('click', async function () {
    if (!$('#bnt_set_break_step').prop('disabled')) 
        set_break_step()
})

$('#bnt_activ_all_break').on('click', async function () {
    ebreakpoints.deactivate_all()
})

function set_break_step() {
    if (!curr_debug_data?.loc) return
    
    const loc = curr_debug_data.loc
    const expr = curr_debug_data.expr

    if (!ebreakpoints.find_item(expr.loc)) {
        ebreakpoints.add(loc, expr)
    } else {
        ebreakpoints.remove(loc)
    }
}

