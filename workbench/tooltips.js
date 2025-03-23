$(function () {

    $('#tooltip-element').on("mouseenter",
        function (event) {
            var tooltip = $('<div id="tooltip" class="tooltip">lala</div>') // Erstelle das Tooltip-Element

            // Lade die externe HTML-Datei per AJAX
            $.ajax({
                url: 'tooltip-markdowns/debug.html', // Pfad zu deiner externen HTML-Datei
                method: 'GET',
                dataType: 'text',
                success: function (data) {
                    console.log(data.toString())
                    tooltip.html(data) // Füge den Inhalt der externen Datei in das Tooltip ein
                    $('body').append(tooltip) // Hänge das Tooltip an den Body an
                    tooltip.css({
                        top: event.pageY + 10 + 'px',
                        left: event.pageX + 10 + 'px'
                        // top: '1000px',
                        // left: '1000px'
                    }).fadeIn()

                }
            })

        }
    )
    $('#tooltip-element').on("mouseleave",
        function () {
            $('#tooltip').fadeOut(function () {
                $(this).remove() // Entferne das Tooltip, wenn der Hover endet
            })
        }


    )
})