// ################### keys

var period_pressed

function debug_started() {
    return !$('#bnt_run').prop('disabled')
}



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

        if (dialog_ctrl_more_open) {
            let b = false
            if (event.code === 'F8' && debug_started()) {
                $('#bnt_run').trigger('click')
                b = true
            } else if (event.code === 'F5' && debug_started()) {
                $('#bnt_step').trigger('click')
                b = true
            } else if (event.ctrlKey && event.code === 'F3' && debug_started()) {
                $('#bnt_restart').trigger('click')
                b = true
            } else if (event.ctrlKey && event.code === 'F2' && debug_started()) {
                $('#bnt_stop').trigger('click')
                b = true
            } else if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
                $('#bnt_start').trigger('click')
                b = true
            } else if (event.altKey && event.shiftKey && event.code === 'KeyB') {
                $('#bnt_remove_all_break').trigger('click')
                b = true
            }
            if (b) event.preventDefault()
        }

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
                    case 'BracketLeft':
                        test()
                        event.preventDefault()
                        break

                    default:
                        break
                }
            } else {
                switch (event.code) {
                    case 'KeyM':
                        $('#bnt_ctrl_more').trigger('click')
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
                    case 'KeyS':
                        $('#bnt_set_break_step').trigger('click')
                        event.preventDefault()
                        period_pressed = false
                        break
                    case 'KeyA':
                        $('#').trigger('click')
                        event.preventDefault()
                        period_pressed = false
                        break
                    case 'KeyD':
                        if (dialog_ctrl_more_open) $('#bnt_activ_all_break').trigger('click')
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
            // if (event.code === 'Escape') {
            //     $('#select_examples').trigger('focus')
            //     event.preventDefault()
            // }
            // return true
        }
    })
})

function define_monaco_keys() {

    // monaco keys

    // monaco_editors.apath.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    monaco_editors.apath.addCommand(monaco.KeyCode.F8, function () {
        if (debug_started()) $('#bnt_run').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyCode.F5, function () {
        if (debug_started()) $('#bnt_step').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F3, function () {
        if (debug_started()) $('#bnt_restart').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F2, function () {
        if (debug_started()) $('#bnt_stop').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyB, function () {
        if (dialog_ctrl_more_open) $('#bnt_set_break').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyB, function () {
        if (dialog_ctrl_more_open) $('#bnt_remove_all_break').trigger('click')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, function () {
        if (dialog_ctrl_more_open) $('#bnt_start').trigger('focus')
    })
    monaco_editors.apath.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, function () {
        if (period_pressed) {
            if (dialog_ctrl_more_open) $('#bnt_activ_all_break').trigger('click')
            period_pressed = false
        }
    })
    // monaco_editors.apath.addCommand(monaco.KeyCode.Escape , function () {
    //     $('#bnt_store').trigger('focus')
    // })


}