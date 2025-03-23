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



// ########################################### control ###################################################

var use_server = true

async function eval_(input, apath, sfuncs) {

    const sf = $('#toggle_strict_failure').prop('checked')
    const aas = $('#toggle_arrays_as_seq').prop('checked')
    if (!use_server) {
        return window.apath_func_utils_.evaluate(input, apath, sfuncs, sf, aas, debug_callback)
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

    await complete_eval()

})

async function complete_eval() {
    const apath = monaco_editors.apath.getValue()
    const result_editor = monaco_editors.result
    if (apath.trim() === '') {
        result_editor.setValue('')

    } else {

        const sfuncs = monaco_editors.sfuncs.getValue().trim()

        try {
            const input = monaco_editors.input.getValue()

            trace = []
            const e = await eval_(input, apath, `${sfuncs}`)
            const results = e.result
            if (results === null) {
            } else {
                let base_result = e.empty_ast ? '' : results === '' ? '- no solutions found -' : results
                if (e.warnings.length !== 0) base_result = `warnings: ${e.warnings.toString()}\n++++++++++++\n\n` + base_result
                result_editor.setValue(base_result)
                return base_result
            }

        } catch (error) {
            result_editor.setValue(error.toString())
        }
    }
}

function on_editor_change() {

    if ($('#toggle_live_eval').prop('checked')) {
        setTimeout(function () { $('#bnt_eval_apth').trigger('click') }, 10)
    }
}

$('#bnt_store').on('click', function () {
    store()
})

$('#bnt_restore').on('click', function (e) {
    // restore(e)
    $('#file-input').trigger('click')
})

$('#toggle_dark').on('change', function () {
    monaco.editor.setTheme(this.checked ? 'apath' : 'vs')
})

$('#file-input').on('change', function (e) {
    restore(e)
    document.getElementById("file-input").value = "";
    remove_breakpoints()
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
    remove_breakpoints()
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
    remove_breakpoints()
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


$('#bnt_doc').on('click', async function () {
    // open_link('doc/doc-1.html')
    // open_link('generated-doc/site/workbench/workbench.html#control-panel')
    open_link('generated-doc/site/workbench/workbench.html')
})

$('#bnt_cheat_sheet').on('click', async function () {
    let exa = $('#select_examples').find(':selected').val()
    open_link(`generated-doc/site/cheat-sheet.html#e-${exa}`)
})


var dialog_ctrl_more_open = false
$(function () {
    $('#dialog_ctrl_more').dialog({
        autoOpen: false,
        closeText: 'hide',
        resizable: false,
        draggable: false,
        width: 255,
        position: { my: 'left top+115', at: 'left top' },
        classes: {
            'ui-dialog': 'dia-widget'
        },

        close: function (event, ui) {
            dia_close()
        }
    })
})

$('#bnt_ctrl_more').on('click', function () {
    if (dialog_ctrl_more_open) return
    dialog_ctrl_more_open = true
    special_left_trans = 210
    // curiously with swinging in
    for (let i = 0; i < 5; i++) fit(undefined, true)

    $('#dialog_ctrl_more').dialog('open')
    set_editor_ro(true)
})


function dia_close() {
    $('#dialog_ctrl_more').dialog('close')
    special_left_trans = 0
    for (let i = 0; i < 5; i++) fit(undefined, true)
    set_debug_state('init')
    remove_breakpoints()
    set_editor_ro(false)
    dialog_ctrl_more_open = false
    $('#bnt_eval_apth').trigger('click')
}

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
                <optgroup label='${key}'>
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

    set_debug_state('init')

    define_monaco_keys()

    //!!!test
    // $('#bnt_ctrl_more').trigger('click')
    //

}


// ################### highlight data ################################################################



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
    target.apath[key] = no_last_br(await monaco.editor.colorize(apath, 'apath'))
    target.input[key] = no_last_br(await monaco.editor.colorize(input, 'javascript'))
    target.result[key] = no_last_br(await monaco.editor.colorize(r, 'text'))
}

async function save_highlighting() {

    const topic = $('#select_topics').find(':selected').text()
    const result = await build_highlighting(topic)
    downloadToFile('export const highlight = ' + JSON.stringify(result, null, 3), `data-dyn-highlight-${topic}.js`, 'text/plain')
}


