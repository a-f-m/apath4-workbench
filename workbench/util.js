var js_store = {}

var last_loaded_file = 'wb-1.json'
function readSingleFile(e, func_consume) {
    if (!e.target.files[0]) {
        return
    }
    last_loaded_file = e.target.files[0].name
    var reader = new FileReader()
    reader.onload = function(e) {
        var contents = e.target.result
        // displayContents(contents, area)
        func_consume(contents)
    }
    reader.readAsText(e.target.files[0])
}

function downloadToFile(content, filename, contentType) {
    const a = document.createElement('a')
    const file = new Blob([content], { type: contentType })

    a.href = URL.createObjectURL(file)
    a.download = filename !== '' ? filename : last_loaded_file
    a.click()

    URL.revokeObjectURL(a.href)
}


function store_data(name, d) {
    js_store[name] = d
    console.log(d)
    // let x = JSON.stringify(js_store, null, 3)
    let x = JSON.stringify(js_store, null, 0)
    console.log(x)
    localStorage.setItem('store', x)
}

function restore_data(name) {
    const s = localStorage.getItem('store')
    if (s) {
        js_store = JSON.parse(s)
        return js_store[name]
    } else {
        return examples[examples.first_example.value]
    }
}


function open_blob(text, type) {

    let tempLink = document.createElement("a")

    // {type: 'text/plain'}
    let blob = new Blob([text], { type: type })

    tempLink.setAttribute('href', URL.createObjectURL(blob))
    tempLink.setAttribute('target', '_blank')

    // tempLink.setAttribute('download', `${name.toLowerCase()}.txt`)
    // tempLink.setAttribute('download', file)

    tempLink.click()

}

function open_link(href) {

    let tempLink = document.createElement("a")
    tempLink.setAttribute('href', href)
    tempLink.setAttribute('target', '_blank')
    tempLink.click()
}

function process_file(file, f) {

    $.ajax({
        url: file, 
        async: false,
        // contentType: 'text/javascript',
        dataType: 'text',
        success: f
    })
}

function fetch_example_set(exa_set) {

    if (exa_set === null) exa_set = './data.js'

    var script = document.createElement("script")
    script.src = exa_set
    document.documentElement.firstChild.appendChild(script)
}