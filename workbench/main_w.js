// ########################################### store/restore ###########################################

function set_data(d) {

    const aaseq = d.data.aaseq
    // $('#toggle_arrays_as_seq').prop('checked', aaseq === true)
    monaco_editors.input.setValue(d.data.input)
    monaco_editors.apath.setValue((d.data.remark ? '// ' + d.data.remark + '\n' : '') + d.data.apath)
    monaco_editors.sfuncs.setValue(d.data.sfuncs ? d.data.sfuncs : '')
    set_geom(d.geom)
}

function restore(e) {

    readSingleFile(e, (content) => {

        const d = JSON.parse(content)
        if (d) {
            set_data(d)
            set_geom(d.geom)
        }
    })
}

function restore_1(e) {

    readSingleFile(e, (content) => {

        const d = JSON.parse(content)
        examples = d
        set_exa_select(examples.first_example.value)
    })
}

function store() {

    let d = {
        data: {
            input: monaco_editors.input.getValue(),
            apath: monaco_editors.apath.getValue(),
            sfuncs: monaco_editors.sfuncs.getValue()
        },
        geom: get_geom()
    }
    downloadToFile(JSON.stringify(d, null, 3), '', ' text/plain')
}

function store_1() {

    downloadToFile(JSON.stringify(examples, null, 3), '', 'application/json')
}



// ########################################### control ###################################################

var use_server = true

async function eval_(input, apath, sfuncs) {

    const sf = $('#toggle_strict_failure').prop('checked')
    const aas = $('#toggle_arrays_as_seq').prop('checked')
    if (!use_server) {
        return window.apath_func_utils_.evaluate(input, apath, sfuncs, sf, aas)
    } else {
        const args = window.Utils_.encode_object([input, apath, sfuncs, sf, aas])
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

$('#bnt_store').on('click', function () {
    store()
})
$('#bnt_restore').on('click', function (e) {
    $('#file-input').trigger('click')
})

$('#toggle_dark').on('change', function () {
    monaco.editor.setTheme(this.checked ? 'apath' : 'vs')
})

$('#file-input').on('change', function (e) {
    restore(e)
})
    
$('#toggle_live_eval').on('change', function () {
    $('#bnt_eval_apth').trigger('click')
})
$('#toggle_strict_failure').on('change', function () {
    $('#bnt_eval_apth').trigger('click')
})
$('#toggle_arrays_as_seq').on('change', function () {
    $('#bnt_eval_apth').trigger('click')
})

$('#select_examples').on('change', function (e) {
    const valueSelected = ree_exa = this.value
    localStorage.setItem('ree_exa', valueSelected)
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
        ree_exa = examples.first_example.value
        set_exa_select(ree_exa)
        localStorage.setItem('ree_exa', ree_exa)
    })
}

function get_exa_file_1(f) {
    
    process_file(f, function (text) {
        examples = JSON.parse(text)
        set_exa_select(examples.first_example.value)
    })
}

function get_wb_file(f) {
    
    process_file(f, function (text) {
        const d = JSON.parse(text)
        if (d) {
            set_data(d)
            set_geom(d.geom)
        }
    })
}

$('#select_topics').on('change', function (e) {
    ree_topic = $(this).find(':selected').attr('id')
    localStorage.setItem('ree_topic', ree_topic)
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
    const ast = new window.Parser__.Parser()
        // .setting({ w_loc: false, no_empty_left: true, w_data: false })
        .setting({ w_loc: false })
        .parse(monaco_editors.apath.getValue())
    open_blob(JSON.stringify(ast, null, 3), 'text/plain')
})

$('#bnt_trp').on('click', async function () {

    const input = monaco_editors.input.getValue()
    const apath = monaco_editors.apath.getValue()
    const sfuncs = monaco_editors.sfuncs.getValue().trim()
    const trp = (await eval_(input, apath, `${sfuncs}`)).trp

    open_blob(trp, 'text/plain')
})

$('#bnt_save_as_dyn').on('click', function () {
    console.log(JSON.stringify(data_dyn(), null, 3))
    // open_blob(JSON.stringify(examples, null, 3), 'application/json')
    downloadToFile(JSON.stringify(examples, null, 3), 'dyn-test.json', 'application/json')

})
$('#bnt_load_dyn').on('click', function (e) {
    $('#file-input').trigger('click')
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

var period_pressed

$(function () {
    $(document).on('keydown', function (event) {
        // console.log(event)
        const key = String.fromCharCode(event.which)
        // console.log('charkey: ' + key)
        // console.log('code: ' + event.code)
        
        // if (last_key === 'ControlLeft' && event.code === 'Digit1') {
        //     console.log('hi')
        //     event.preventDefault()
        // }

        // console.log('enter: ' + period_pressed)

        const keys = 'KeyS|F7|KeyE|Numpad0|KeyB|Numpad1|Numpad2|Numpad3|Numpad4|F5|F6|NumpadDecimal|KeyA|KeyG|KeyC'
        const is_key = event.code.match(keys)
        
        if (event.ctrlKey && !event.shiftKey) {
            if (!period_pressed) {
                switch (event.code) {
                    // case 'Period':
                    //     period_pressed = true
                    //     break

                    case 'KeyS':
                        $('#bnt_store').trigger('click')
                        event.preventDefault()
                        break
                    case 'F7':
                        $('#bnt_restore').trigger('focus')
                        event.preventDefault()
                        break
                    case 'KeyE':
                        $('#bnt_eval_apth').trigger('click')
                        event.preventDefault()
                        break
                    case 'Numpad0':
                        $('#toggle_live_eval').prop('checked', !$('#toggle_live_eval').prop('checked'))
                        $('#bnt_eval_apth').trigger('click')
                        event.preventDefault()
                        break
                    case 'KeyB':
                        $('#toggle_dark').trigger('click')
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
                    case 'NumpadDecimal':
                        save_highlighting()
                        event.preventDefault()
                        break

                    default:
                        break
                }
            } else {
                switch (event.code) {
                    case 'KeyA':
                        $('#bnt_ast').trigger('click')
                        event.preventDefault()
                        period_pressed = false
                        break
                    case 'KeyG':
                        $('#bnt_grammar').trigger('click')
                        event.preventDefault()
                        period_pressed = false
                        break
                    case 'KeyC':
                        $('#bnt_cheat_sheet').trigger('click')
                        event.preventDefault()
                        period_pressed = false
                        break
                    default:
                        break
                }

            }
            // console.log('user key')
            if (!period_pressed) period_pressed = event.code === 'Period'
            // console.log('leave: ' + period_pressed)
        } else {
            if (event.code === 'Escape') {
                $('#select_examples').trigger('focus')
                event.preventDefault()
            }
            return true
        }
    })
})

$('#toggle_fit').prop('checked', true)
$('#toggle_dark').prop('checked', true)
$('#toggle_live_eval').prop('checked', true)
$('#toggle_strict_failure').prop('checked', false)
$('#toggle_arrays_as_seq').prop('checked', false)
$(function () {
    console.log('ready!')
    window.onresize = fit
    fit(undefined, true)
})

function setup() {

    // for reentrant after F5
    
    const params = new URLSearchParams(window.location.search)

    const clear = params.get('clear')
    if (clear === null || clear === 'true') localStorage.clear()
    const ree_topic = localStorage.getItem('ree_topic')
    const ree_exa = localStorage.getItem('ree_exa')
    
    // e. g. ?unhide-topic=topic-peter&topic=topic-peter
    for (const utopic of params.getAll('unhide-topic')) $(`#${utopic}`).removeAttr('hidden')

    let topic = ree_topic ? ree_topic : params.get('topic')
    if (topic === null) topic = 'topic-basic'
    const t = $(`#select_topics option[id='${topic}']`)
    t.prop('selected', true)
    get_exa_file(t.attr('value'))


    let exa = ree_exa ? ree_exa : params.get('exa')
    if (exa === null) exa = examples.first_example.value

    use_server = params.get('use-server')
    console.log(use_server)

    set_exa_select(exa)

    let wb_file = params.get('wb-file')
    if (wb_file !== null) {
        get_wb_file(wb_file)
    }
}

// ################### highlight data

// function to_all_blanks(s) {
//     return s
//         // .replaceAll('\n\s*', '')
//         // .replace(/ +(?= )/g, '')
//         .replace(/\n\s*/g, '')
// }

function to_all_blanks(s) {
    return s.replaceAll('\n', ' ').replace(/ +(?= )/g, '')
}
function to_result(s) {
    return to_all_blanks(s).replaceAll('------', ',').trim().replace(new RegExp(',$'), '')
}

function no_last_br(s) {
    return s.toString().replace(new RegExp('\\<br\\/\\>$'), '')
}

async function build_highlighting(topic) {

    let result = { 
        cheat_cheet: { apath: {}, input: {}, result: {} }, 
        doc: { apath: {}, input: {}, result: {} } }

    for (const key in examples) {

        if (examples[key].ignore) continue

        const data = examples[key].data
        const sf = $('#toggle_strict_failure').prop('checked')
        const aas = $('#toggle_arrays_as_seq').prop('checked')
        if (data) {
                // .replaceAll(new RegExp('//.*\n', 'g'), '')
            // const input = data.input_nl
            const sfuncs = data.sfuncs
            let r
            try {
                r = to_result(window.apath_func_utils_.evaluate(
                        (data.input_nl ? data.input : to_all_blanks(data.input)),
                        data.apath, sfuncs, sf, aas).result)
            } catch (error) {
                console.log(error)
                r = 'error'
            }
            console.log('hl key: ' + key)

            const apath = data.with_comments ? data.apath : data.apath.replaceAll(new RegExp('//.*\n', 'g'), '')
            await extend_highlight(result.cheat_cheet, key, 
                apath, 
                (data.input_nl ? data.input : to_all_blanks(data.input)), 
                r)
            await extend_highlight(result.doc, key, 
                apath, 
                data.input, 
                r)
        }
    }
    console.log(result)
    return result
}

async function extend_highlight(target, key, apath, input, r) {
    target.apath[key] = no_last_br(await monaco.editor.colorize(apath, "apath"))
    target.input[key] = no_last_br(await monaco.editor.colorize(input, "javascript"))
    target.result[key] = no_last_br(await monaco.editor.colorize(r, "text"))
}

async function save_highlighting() {

    const topic = $('#select_topics').find(":selected").text()
    const result = await build_highlighting(topic)
    downloadToFile('export const highlight = ' + JSON.stringify(result, null, 3), `data-dyn-highlight-${topic}.js`, 'text/plain')
}


