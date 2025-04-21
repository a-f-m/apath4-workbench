
// ########################################### monaco #######################################################
// snippet from chatGPT ;;)


var monaco_editors = {}

require.config({ paths: { vs: 'monaco/vs' } })

require(['vs/editor/editor.main'], function () {


    // ##################### syntax highli for apath
    monaco.languages.register({ id: 'apath' })

    // Define the tokens (syntax highlighting rules) for the language
    monaco.languages.setMonarchTokensProvider('apath', tokenProvider)

    // Define the language configuration (brackets, comments, etc.)
    monaco.languages.setLanguageConfiguration('apath', langConfig)

    monaco.editor.defineTheme('apath', theme)
    monaco.editor.setTheme('apath')


    // ##################### 

    function create_editor(e, kind) {

        const d = examples[examples.first_example.value].data
        return monaco.editor.create(e, {
            theme: kind === 'apath' ? 'apath' : 'vs-dark',
            // theme: kind === 'apath',
            language: kind === 'input' ? 'json' : kind === 'apath' ? 'apath' : kind === 'sfuncs' ? 'javascript' : 'text',
            minimap: { enabled: false },
            // lineNumbers: 'off',
            wordWrap: 'on',
            tabSize: 2,
            // fontSize: 14,
            automaticLayout: true,
            // "bracketPairColorization.enabled": false
            keybindings: {
                'Ctrl+D': {
                }
            }
        })
    }
    monaco_editors['input'] = create_editor(document.getElementById('monaco_input'), 'input')
    monaco_editors['result'] = create_editor(document.getElementById('monaco_result'), 'result')
    monaco_editors['sfuncs'] = create_editor(document.getElementById('monaco_sfuncs'), 'sfuncs')
    monaco_editors['apath'] = create_editor(document.getElementById('monaco_apath'), 'apath')
    monaco_editors.input.onDidChangeModelContent(function (e) {
        on_editor_change()
    })
    monaco_editors.apath.onDidChangeModelContent(function (e) {
        // editor_sync = new window.Channel_.SyncFlag()
        remap_sync = new window.Channel_.SyncFlag()
        on_editor_change(true);
        // e.changes.forEach(change => {
        //     if (change.text.length > 0) {
        //         // console.log('Sichtbares Zeichen eingegeben:', change.text)
        //     }
        // })
        (async () => {
            await remap_sync.wait()
            ebreakpoints.remap()
        })();
    })
    monaco_editors.apath.onKeyDown((e) => {
        // console.log('Key down event:', e)
    })
    // monaco_editors.apath.onDidChangeCursorPosition (function (e) {
    //     console.log('hu')
    // })
    monaco_editors.apath.onDidChangeCursorPosition(function (e) {
        onApathDidChangeCursorPosition(e)
    })
    monaco_editors.sfuncs.onDidChangeModelContent(function (e) {
        on_editor_change()
    })

    setup()
})

