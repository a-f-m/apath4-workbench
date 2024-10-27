// ########################################### store/restore ###########################################

function set_data(d) {

    monaco_editors.input.setValue(d.data.input)
    monaco_editors.apath.setValue((d.data.remark ? '// ' + d.data.remark + '\n' : '') + d.data.apath)
    monaco_editors.sfuncs.setValue(d.data.sfuncs ? d.data.sfuncs : '')
    set_geom(d.geom)
}

function restore() {

    const d = restore_data('_default')
    if (d) set_data(d)
    if (d) set_geom(d.geom)
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

var use_server = true

async function eval_(input, apath, sfuncs) {

    const sf = $('#toggle_strict_failure').prop('checked')
    if (!use_server) {
        return window.apath_func_utils_.evaluate(input, apath, sfuncs, sf)
    } else {
        const args = window.Utils_.encode_object([input, apath, sfuncs, sf])
        let ret
        $.ajax({
            url: `op?func=eval&args=${args}`, 
            async: false,
            // contentType: 'text/javascript',
            dataType: 'text',
            success: function (result) {
                ret = window.Utils_.decode_to_object(result)
                console.log(ret)
            }
        })
        if (ret.error) {
            throw new Error(ret.error)
        }
        return ret.return_value
    }
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

        const e = await eval_(input, apath, `${sfuncs}`)
        const results = e.result
        if (results === null) {
        } else {
            result_editor.setValue(e.empty_ast ? '' : results === '' ? '- no solutions found -' : results)
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
$('#bnt_restore_layout').on('click', function () {
    restore()
})

$('#toggle_dark').on('change', function () {
    monaco.editor.setTheme(this.checked ? 'vs-dark' : 'vs')
})

$('#toggle_live_eval').on('change', function () {
    $('#bnt_eval_apth').trigger('click')
})
$('#toggle_strict_failure').on('change', function () {
    $('#bnt_eval_apth').trigger('click')
})

$('#select_examples').on('change', function (e) {
    const valueSelected = this.value
    const exa = examples[valueSelected]
    set_data(exa)
    fit(undefined, true)
})

function get_exa_file(f) {
    
    process_file(f, function (text) {
        // console.log('xml error well-known for firefox - ignore it')
        eval(text)
        //
        console.log(examples = data_dyn())
        set_exa_select(examples.first_example.value)
    })
}

$('#select_topics').on('change', function (e) {
    get_exa_file(this.value)
})

$('#toggle_fit').on('change', function (e) {
    fit(undefined, true)
})

$('#bnt_grammar').on('click', function () {
    let grammar = examples[$('#select_examples').find(':selected').val()].data.grammar
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
    const trp = (await eval_(input, apath, `${sfuncs}`)).trp

    open_blob(trp, 'text/plain')
})

$('#bnt_doc').on('click', async function () {
    // open_link('doc/doc-1.html')
    // open_link('generated-doc/site/workbench/workbench.html#control-panel')
    open_link('generated-doc/site/workbench/workbench.html')
})

$('#bnt_cheat_sheet').on('click', async function () {
    let exa = $('#select_examples').find(':selected').val()
    open_link(`generated-doc/site/cheat-sheet.html#e-${exa}`)
})

$('#bnt_exa_step_funcs').on('click', function () {
    open_link('./default-step-funcs/step-funcs-1.js')
})


// ################### exa select field

function set_exa_select(exa) {

    html_opt = ''
    let i = 0
    for (const key in examples) {
        const item = examples[key]
        if (item.group) {
            if (i !== 0) {
                html_opt += `
                </optgroup>
                `
            }
            html_opt += `
                <optgroup label="${key}">
            `
            i++
        } else if (item.data) {
            html_opt += `
                    <option>${key}</option>
            `
        }
    }
    html_opt += `
                    </optgroup>
    `
    $('#select_examples').html(html_opt)


    $('#select_examples').val(exa)
    set_data(examples[exa])

    fit(undefined, true)

}

// ################### keys

var last_key

$(function () {
    $(document).on('keydown', function (event) {
        // console.log(event)
        const key = String.fromCharCode(event.which)
        // console.log('charkey: ' + key)
        console.log('code: ' + event.code)
        
        // if (last_key === 'ControlLeft' && event.code === 'Digit1') {
        //     console.log('hi')
        //     event.preventDefault()
        // }
        
        last_key = event.code
        if (event.ctrlKey && !event.shiftKey) {
            switch (event.code) {
                case 'KeyS':
                    $('#bnt_store_layout').trigger('click')
                    event.preventDefault()
                    break
                case 'KeyR':
                    $('#bnt_restore_layout').trigger('click')
                    event.preventDefault()
                    break
                case 'KeyE':
                    $('#bnt_eval_apth').trigger('click')
                    // monaco_editors['result'].focus()
                    event.preventDefault()
                    break
                    case 'Numpad0':
                    $('#toggle_live_eval').prop('checked', ! $('#toggle_live_eval').prop('checked'))
                    $('#bnt_eval_apth').trigger('click')
                    event.preventDefault()
                    break
                case 'Numpad1':
                    monaco_editors['input'].focus()
                    event.preventDefault()
                    break
                case 'Numpad2':
                    monaco_editors['apath'].focus()
                    event.preventDefault()
                    break
                case 'Numpad3':
                    monaco_editors['sfuncs'].focus()
                    event.preventDefault()
                    break
                case 'Numpad4':
                    monaco_editors['result'].focus()
                    event.preventDefault()
                    break
                case 'F5':
                    $('#select_topics').trigger('focus')
                    event.preventDefault()
                    break
                case 'F6':
                    $('#select_examples').trigger('focus')
                    event.preventDefault()
                    break

                default:
                    break
                }
            // console.log('user key')
        } else {
            return true
        }
    })
})


// ########################################### monaco #######################################################

var monaco_editors = {}

require.config({ paths: { vs: 'monaco/vs' } })

require(['vs/editor/editor.main'], function () {

    function create_editor(e, kind) {

        const d = examples[examples.first_example.value].data
        return monaco.editor.create(e, {
            theme: 'vs-dark',
            // theme: 'vs',
            language: kind === 'input' ? 'json' : kind === 'apath' ? 'fsharp' : kind === 'sfuncs' ? 'javascript' : 'text',
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
1    })

    const params = new URLSearchParams(window.location.search)

    // e. g. ?unhide-topic=topic-peter&topic=topic-peter
    for (const utopic of params.getAll('unhide-topic')) $(`#${utopic}`).removeAttr('hidden')

    let topic = params.get('topic')
    if (topic === null) topic = 'topic-basic'
    const t = $(`#select_topics option[id='${topic}']`)
    t.prop('selected', true)
    get_exa_file(t.attr('value'))
    
    
    let exa = params.get('exa')
    if (exa === null) exa = examples.first_example.value

    use_server = params.get('use-server')
    console.log(use_server)

    set_exa_select(exa)
})

$('#toggle_fit').prop('checked', true)
$('#toggle_dark').prop('checked', true)
$('#toggle_live_eval').prop('checked', true)
$('#toggle_strict_failure').prop('checked', false)
$(function () {
    console.log('ready!')
    window.onresize = fit
    fit(undefined, true)
})

