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

// ############################### from gemini ;) ##########################################

/**
 * Fügt einen String an einer bestimmten Zeilen- und Spaltenposition in einem mehrzeiligen String ein.
 *
 * @param {string} originalString Der ursprüngliche String.
 * @param {string} stringToInsert Der String, der eingefügt werden soll.
 * @param {number} line Die Zeilennummer (1-indiziert).
 * @param {number} column Die Spaltennummer (1-indiziert).
 * @returns {string} Der String mit dem eingefügten Inhalt.
 */
function insert_string_at_pos(originalString, stringToInsert, line, column) {
    const lines = originalString.split('\n');
  
    // Überprüfen, ob die Zeile innerhalb der Grenzen liegt
    if (line < 1 || line > lines.length) {
      console.warn(`Warnung: Zeile ${line} ist außerhalb der Grenzen. Der String wird am Ende angehängt.`);
      // Alternativ könntest du hier einen Fehler werfen oder den String nicht ändern
      return originalString + '\n' + stringToInsert;
    }
  
    const targetLineIndex = line - 1; // 0-indiziertes Array
  
    let targetLine = lines[targetLineIndex];
  
    // Überprüfen, ob die Spalte innerhalb der Grenzen der Zielzeile liegt
    if (column < 1 || column > targetLine.length + 1) { // +1 um Einfügen am Ende der Zeile zu ermöglichen
      console.warn(`Warnung: Spalte ${column} ist außerhalb der Grenzen für Zeile ${line}. Der String wird am Ende der Zeile angehängt.`);
      lines[targetLineIndex] = targetLine + stringToInsert;
    } else {
      const part1 = targetLine.substring(0, column - 1); // 0-indizierter substring
      const part2 = targetLine.substring(column - 1);
      lines[targetLineIndex] = part1 + stringToInsert + part2;
    }
  
    return lines.join('\n');
  }
  
  // Beispielanwendung:
  
//   let myString = `Dies ist Zeile 1.
//   Dies ist Zeile 2.
//   Dies ist Zeile 3.`;
  
//   console.log("Original String:");
//   console.log(myString);
  
//   // Beispiel 1: Einfügen in Zeile 2, Spalte 6
//   let newString1 = insertStringAtLineColumn(myString, "NEU-", 2, 6);
//   console.log("\nNach Einfügen (Zeile 2, Spalte 6):");
//   console.log(newString1);
//   // Erwartet:
//   // Dies ist Zeile 1.
//   // Dies NEU-ist Zeile 2.
//   // Dies ist Zeile 3.
  
//   // Beispiel 2: Einfügen am Anfang von Zeile 1
//   let newString2 = insertStringAtLineColumn(myString, "START-", 1, 1);
//   console.log("\nNach Einfügen (Zeile 1, Spalte 1):");
//   console.log(newString2);
//   // Erwartet:
//   // START-Dies ist Zeile 1.
//   // Dies ist Zeile 2.
//   // Dies ist Zeile 3.
  
//   // Beispiel 3: Einfügen am Ende von Zeile 3
//   let newString3 = insertStringAtLineColumn(myString, "-ENDE", 3, myString.split('\n')[2].length + 1);
//   console.log("\nNach Einfügen (Zeile 3, am Ende):");
//   console.log(newString3);
//   // Erwartet:
//   // Dies ist Zeile 1.
//   // Dies ist Zeile 2.
//   // Dies ist Zeile 3.-ENDE
  
//   // Beispiel 4: Ungültige Zeilennummer (außerhalb der Grenzen)
//   let newString4 = insertStringAtLineColumn(myString, "ZUSATZ", 5, 1);
//   console.log("\nNach Einfügen (ungültige Zeile 5):");
//   console.log(newString4);
//   // Erwartet: (Warnung in der Konsole)
//   // Dies ist Zeile 1.
//   // Dies ist Zeile 2.
//   // Dies ist Zeile 3.
//   // ZUSATZ
  
//   // Beispiel 5: Ungültige Spaltennummer (innerhalb der Grenzen einer Zeile, aber zu groß)
//   let newString5 = insertStringAtLineColumn(myString, "WEIT", 2, 50);
//   console.log("\nNach Einfügen (ungültige Spalte 50 in Zeile 2):");
//   console.log(newString5);
//   // Erwartet: (Warnung in der Konsole)
//   // Dies ist Zeile 1.
//   // Dies ist Zeile 2.WEIT
//   // Dies ist Zeile 3.