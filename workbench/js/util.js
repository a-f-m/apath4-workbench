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

// ############################### from gemini ;) ############################################################################################
function define_popup($button, $popup, fadeout, fadeIn) {

    const fadeout_ = fadeout !== undefined ? fadeout : 200

    let hoverTimeout //  Wird verwendet, um das Ausblenden zu verzögern


    // Funktion zum Positionieren des Popups direkt unter dem Button
    function positionPopup() {
        const buttonOffset = $button.offset() //  Position des Buttons im Dokument
        const buttonHeight = $button.outerHeight() //  Höhe des Buttons (inkl. Padding/Border)

        $popup.css({
            top: buttonOffset.top + buttonHeight + 0, // 10px unter dem Button
            left: buttonOffset.left - 150 // Linksbündig mit dem Button
        })
    }

    // Wenn der Cursor über den Button oder das Popup selbst fährt
    $button.hover(
        function () {
            clearTimeout(hoverTimeout) //  Laufenden Ausblend-Timeout löschen
            positionPopup() //  Popup vor dem Anzeigen positionieren
            $popup.fadeIn(fadeIn) //  Popup einblenden (Dauer: 200ms)
            // $popup.show() //  Popup einblenden (Dauer: 200ms)
        },
        function () {
            // Wenn der Cursor den Button verlässt, einen Timeout zum Ausblenden setzen
            // Das gibt dem Benutzer Zeit, die Maus zum Popup zu bewegen
            hoverTimeout = setTimeout(function () {
                // Nur ausblenden, wenn die Maus nicht über dem Popup ist
                // Die mouseleave-Logik am Popup selbst wird das abfangen
                // $popup.fadeOut(fadeout_)
                $popup.hide()
            }, fadeout_)
        }
    )

    // Wenn der Cursor das Popup verlässt
    $popup.on('mouseleave', function () {
        // Hier direkt ausblenden, da der Benutzer das Popup verlassen hat
        // $popup.fadeOut(fadeout_)
        $popup.hide()
    })

    // Wenn der Cursor das Popup betritt (für den Fall, dass man vom Button kommt)
    $popup.on("mouseenter", function () {
        clearTimeout(hoverTimeout) //  Ausblend-Timeout löschen, falls er noch läuft
    })

    // Optional: Popup schließen, wenn außerhalb geklickt wird
    $(document).on('click', function (e) {
        // Prüfen, ob der Klick außerhalb von Button UND Popup war
        if (!$button.is(e.target) && !$popup.is(e.target) && $popup.has(e.target).length === 0) {
            // $popup.fadeOut(fadeout_)
            $popup.hide()
        }
    })
}


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

    const lines = originalString.split('\n')
  
    // Überprüfen, ob die Zeile innerhalb der Grenzen liegt
    if (line < 1 || line > lines.length) {
      console.warn(`Warnung: Zeile ${line} ist außerhalb der Grenzen. Der String wird am Ende angehängt.`)
      // Alternativ könntest du hier einen Fehler werfen oder den String nicht ändern
      return originalString + '\n' + stringToInsert
    }
  
    const targetLineIndex = line - 1 //  0-indiziertes Array
  
    let targetLine = lines[targetLineIndex]
  
    // Überprüfen, ob die Spalte innerhalb der Grenzen der Zielzeile liegt
    if (column < 1 || column > targetLine.length + 1) { // +1 um Einfügen am Ende der Zeile zu ermöglichen
      console.warn(`Warnung: Spalte ${column} ist außerhalb der Grenzen für Zeile ${line}. Der String wird am Ende der Zeile angehängt.`)
      lines[targetLineIndex] = targetLine + stringToInsert
    } else {
      const part1 = targetLine.substring(0, column - 1) //  0-indizierter substring
      const part2 = targetLine.substring(column - 1)
      lines[targetLineIndex] = part1 + stringToInsert + part2
    }
  
    return lines.join('\n')
  }

/**
 * Ersetzt einen bestimmten Bereich in einem mehrzeiligen String durch einen neuen String.
 * Die Ersetzung beginnt an der Startposition des zu löschenden Bereichs.
 *
 * @param {string} originalString Der ursprüngliche String.
 * @param {string} stringToInsert Der String, der eingefügt werden soll (ersetzt den gelöschten Bereich).
 * @param {number} startLine Die Startzeilennummer (1-indiziert) des zu ersetzenden Bereichs.
 * @param {number} startColumn Die Startspaltennummer (1-indiziert) des zu ersetzenden Bereichs.
 * @param {number} endLine Die Endzeilennummer (1-indiziert) des zu ersetzenden Bereichs.
 * @param {number} endColumn Die Endspaltennummer (1-indiziert) des zu ersetzenden Bereichs.
 * @returns {string} Der String mit dem ersetzten Inhalt.
 */
function replace_range_in_string(
  originalString,
  stringToInsert,
  startLine, startColumn, endLine, endColumn
) {
  let lines = originalString.split('\n');
  let resultLines = [];
  let insertHandled = false; // Flag, um sicherzustellen, dass das Einfügen nur einmal passiert

  for (let i = 0; i < lines.length; i++) {
      const currentLineIndex = i; // 0-indiziert
      const currentLine = lines[currentLineIndex];

      // Wenn die aktuelle Zeile außerhalb des zu ersetzenden Bereichs liegt, unverändert übernehmen
      if (currentLineIndex + 1 < startLine || currentLineIndex + 1 > endLine) {
          resultLines.push(currentLine);
          continue;
      }

      // --- Logik für die Zeilen im Ersatzbereich ---

      // Wenn die aktuelle Zeile die Startzeile ist
      if (currentLineIndex + 1 === startLine) {
          let partBeforeStart = currentLine.substring(0, startColumn - 1);

          // Wenn die Start- und Endzeile identisch sind (Ersatz in einer Zeile)
          if (currentLineIndex + 1 === endLine) {
              let partAfterEnd = currentLine.substring(endColumn - 1);
              resultLines.push(partBeforeStart + stringToInsert + partAfterEnd);
              insertHandled = true; // Einfügen ist in dieser Zeile erfolgt
          } else {
              // Startzeile eines Mehrzeilenersatzes: Teil vor dem Start + Einfüge-String
              resultLines.push(partBeforeStart + stringToInsert);
              insertHandled = true; // Einfügen ist in dieser Zeile erfolgt
          }
          continue; // Diese Zeile ist verarbeitet, weiter zur nächsten
      }

      // Wenn die aktuelle Zeile die Endzeile ist (und nicht die Startzeile war)
      if (currentLineIndex + 1 === endLine) {
          let partAfterEnd = currentLine.substring(endColumn - 1);
          resultLines.push(partAfterEnd);
          continue; // Diese Zeile ist verarbeitet, weiter zur nächsten
      }

      // Wenn die Zeile komplett innerhalb des zu ersetzenden Bereichs liegt (wird vollständig gelöscht)
      // Hier passiert nichts, die Zeile wird einfach nicht zur resultLines hinzugefügt
  }

  // Edge Case: Wenn der Löschbereich am Ende des Dokuments war und der String leer wurde, aber eingefügt werden sollte
  // Das tritt auf, wenn z.B. nur eine Zeile gelöscht wurde und dann nichts eingefügt wird.
  // Oder wenn der StringToInsert mehr Zeilen hat als der gelöschte Bereich und die restlichen Zeilen
  // an das Ende des Dokuments angehängt werden müssen.
  // Die obige Logik deckt das "Einfügen an Startposition" bereits ab,
  // aber wenn der gelöschte Bereich über das Ende des originalen Strings hinausging
  // (was bei validen Start/End-Parametern unwahrscheinlich ist, aber zur Robustheit),
  // müsste man hier noch Logik hinzufügen. Für den gängigen Fall ist es OK so.

  return resultLines.join('\n');
}

  function string_to_pos(s, line, column, skip_nl) {

    const lines = s.split('\n')
    const targetLineIndex = line - 1 //  0-indiziertes Array
    let targetLine = lines[targetLineIndex]
    lines[targetLineIndex] = targetLine.substring(0, column - 1)
    const l_ = lines.slice(0, targetLineIndex + 1).join('\n')
    return skip_nl ? l_.replaceAll(/\r|\n/gm, '') : l_
  }

  function string_from_pos(s, line, column) {

    const lines = s.split('\n')
    const targetLineIndex = line - 1 //  0-indiziertes Array
    let targetLine = lines[targetLineIndex]
    return targetLine.substring(column - 1)
  }

  function path_wo_last(fullPath) {
    
    let pathParts = fullPath.split("/")
    pathParts.pop()
    return pathParts.join("/")
  }

function containsCorrectlyBalancedQuotes(str) {

    let inDoubleQuotes = false;
    let inSingleQuotes = false;
    let inBacktickQuotes = false;
  
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const nextChar = str[i + 1];
  
      // Wenn der aktuelle Char ein Backslash ist, den nächsten Char überspringen
      if (char === '\\') {
        i++ //  Nächstes Zeichen ignorieren, da es escaped ist
        continue;
      }
  
      if (char === '"') {
        if (inSingleQuotes || inBacktickQuotes) {
          // Ignorieren, wenn wir gerade in einfachen Anführungszeichen sind
          continue;
        }
        inDoubleQuotes = !inDoubleQuotes;
      } else if (char === "'") {
        if (inDoubleQuotes || inBacktickQuotes) {
          // Ignorieren, wenn wir gerade in doppelten Anführungszeichen sind
          continue;
        }
        inSingleQuotes = !inSingleQuotes;
      } else if (char === "`") {
        if (inSingleQuotes || inDoubleQuotes) {
          // Ignorieren, wenn wir gerade in doppelten Anführungszeichen sind
          continue;
        }
        inBacktickQuotes = !inBacktickQuotes;
      }
    }
  
    // Am Ende sollten beide Zustände false sein, um Balancierung zu gewährleisten
    return !inDoubleQuotes && !inSingleQuotes && !inBacktickQuotes;
  }
  
