// ########################################### store/restore ###########################################

function set_data(d) {

    monaco_editors.input.setValue(d.data.input)
    monaco_editors.apath.setValue(d.data.apath)
    monaco_editors.sfuncs.setValue(d.data.sfuncs ? d.data.sfuncs : '')
    const store = localStorage.getItem('store')
    set_geom(store ? js_store._default.geom : d.geom)
}

function restore() {

    const d = restore_data('_default')
    if (d) set_data(d)
}

function store() {

    store_data('_default', {
        data: {
            input: monaco_editors.input.getValue(),
            apath: monaco_editors.apath.getValue(),
            sfuncs: monaco_editors.sfuncs.getValue()
        },
        geom: get_geom()
    })
}



// ########################################### control ###################################################

async function eval_(input, apath, sfuncs) {

    // const xxx = import('a.b')
    
    const apart = window.Apart_
    const xxx = apart.isApathIterable(1)
    const apath_ = new window.apath_.Apath()

    if (sfuncs) {

        const funcs = eval(sfuncs)
        for (const func of funcs) {
            apath_.step_func(func)
        }
    }

    const evaluator = apath_.transpile(apath, { strict_failure: $('#toggle_strict_failure').prop('checked') })

    const res = evaluator.evaluate_json(input)

    return { result: res, trp: evaluator.transpilat_text(), empty: apath_.empty_ast }
}

function format_results(results) {

    let s = ''
    for (const result of results) {
        s += JSON.stringify(result, '...', 3) + '\n------\n'
    }
    return s
}

$('#bnt_eval_apth').on('click', async function () {

    const apath = monaco_editors.apath.getValue()
    const result_editor = monaco_editors.result
    if (apath.trim() === '') {
        result_editor.setValue('')
        return
    }
    const sfuncs = monaco_editors.sfuncs.getValue().trim()

    try {
        const input = monaco_editors.input.getValue()

        const e = await eval_(input, apath, `[ ${sfuncs} ]`)
        const results = e.result
        if (results === null) {
        } else {
            const s = format_results(results)
            result_editor.setValue(e.empty ? '' : s === '' ? '- no solutions found -' : s)
        }

    } catch (error) {
        result_editor.setValue(error.toString())
    }

})

function on_editor_change() {

    if ($('#toggle_live_eval').prop('checked')) {
        setTimeout(function () { $('#bnt_eval_apth').trigger('click') }, 10)
    }
}

$('#bnt_store_layout').on('click', function () {
    store()
})

$('#toggle_dark').change(function () {
    monaco.editor.setTheme(this.checked ? 'vs-dark' : 'vs')
})

$('#toggle_live_eval').change(function () {
    $('#bnt_eval_apth').trigger('click')
})
$('#toggle_strict_failure').change(function () {
    $('#bnt_eval_apth').trigger('click')
})

$('#select_examples').on('change', function (e) {
    const valueSelected = this.value
    const exa = examples[valueSelected]
    set_data(exa)
    fit(undefined, true)
})
$('#toggle_fit').on('change', function (e) {
    fit(undefined, true)
})

$('#bnt_grammar').on('click', function () {
    let grammar = examples[$('#select_examples').find(":selected").val()].data.grammar
    if (!grammar) grammar = ''
    open_link(`generated-doc/site/language/grammar.html${grammar}`)
})

$('#bnt_ast').on('click', function () {
    const ast = new window.Parser__.Parser().setting({ w_loc: false }).parse(monaco_editors.apath.getValue())
    open_blob(JSON.stringify(ast, null, 3), 'text/plain')
})

$('#bnt_trp').on('click', async function () {

    const input = monaco_editors.input.getValue()
    const apath = monaco_editors.apath.getValue()
    const sfuncs = monaco_editors.sfuncs.getValue().trim()
    const trp = (await eval_(input, apath, `[ ${sfuncs} ]`)).trp

    open_blob(trp, 'text/plain')
})

$('#bnt_doc').on('click', async function () {
    // open_link('doc/doc-1.html')
    // open_link('generated-doc/site/workbench/workbench.html#control-panel')
    open_link('generated-doc/site/workbench/workbench.html')
})

$('#bnt_cheat_sheet').on('click', async function () {
    let exa = $('#select_examples').find(":selected").val()
    open_link(`generated-doc/site/cheat-sheet.html#e-${exa}`)
})

$('#bnt_exa_step_funcs').on('click', function () {
    open_link('./default-step-funcs/step-funcs-1.js')
})





// ########################################### monaco #######################################################

var monaco_editors = {}

require.config({ paths: { vs: 'monaco/vs' } })

require(['vs/editor/editor.main'], function () {

    function create_editor(e, kind) {

        const d = examples[first_example].data
        return monaco.editor.create(e, {
            // theme: 'vs-dark',
            theme: 'vs',
            language: kind === 'input' ? 'json' : kind === 'apath' ? 'java' : kind === 'sfuncs' ? 'javascript' : 'text',
            minimap: { enabled: false },
            lineNumbers: 'off',
            wordWrap: 'on',
            automaticLayout: true
        })
    }
    monaco_editors['input'] = create_editor(document.getElementById('monaco_input'), 'input')
    monaco_editors['apath'] = create_editor(document.getElementById('monaco_apath'), 'apath')
    monaco_editors['result'] = create_editor(document.getElementById('monaco_result'), 'result')
    monaco_editors['sfuncs'] = create_editor(document.getElementById('monaco_sfuncs'), 'sfuncs')
    monaco_editors.input.onDidChangeModelContent(function (e) {
        on_editor_change()
    })
    monaco_editors.apath.onDidChangeModelContent(function (e) {
        on_editor_change()
    })
    monaco_editors.sfuncs.onDidChangeModelContent(function (e) {
        on_editor_change()
    })
    // restore()
    
    const params = new URLSearchParams(window.location.search)
    let exa = params.get('exa')
    if (exa === null) exa = first_example
    console.log('set exa: ' + exa)
    $('#select_examples').val(exa)
    set_data(examples[exa])
    
    fit(undefined, true)
})

var widgetMousedown = false
$('.widget').on('mousedown', function () {
    widgetMousedown = true
}).on('mouseup', function () {
    widgetMousedown = false
})

$('#toggle_fit').prop('checked', true)
$('#toggle_dark').prop('checked', false)
$('#toggle_live_eval').prop('checked', true)
$(function () {
    console.log('ready!')
    window.onresize = fit
    fit(undefined, true)
})

