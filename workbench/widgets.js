// ########################################### dragging & layouting ###########################################

var widgets = []
for (const w of document.getElementsByClassName('widget')) widgets.push(w)

// not used, deferred
function process_classes(c, excl, f) {
    for (const m of document.getElementsByClassName(c)) if (m !== excl) f(m)
}

function to_top(e) {
    let pos
    let i = 0
    for (const y of widgets) {
        if (y === e[0]) pos = i
        i++
    }
    widgets.splice(0, 0, e[0])
    widgets.splice(pos + 1, 1)
    i = widgets.length
    for (const y of widgets) {
        $(y).css('z-index', i + 100)
        i--
    }
}

//deferred
// $(function () {
//     $('.widget')
//         .draggable() // init
//         .draggable('disable')
//         .draggable('option', 'snap', true)
//         .draggable('option', 'snapTolerance', 5)
//         .draggable('option', 'distance', 5)
//         .draggable('option', 'delay', 100)
//         .draggable('option', 'grid', [5, 5])
//         .draggable('option', 'opacity', 0.5)
//         .on('mousedown', function () {
//             to_top($(this))
//         })
//     $('.widget').resizable({grid: [ 5, 5 ]})

// })

// var dragging = false
// $('.widget-header').on('mousedown', function () {
//     $('.widget').draggable('enable')
//     $(this).css('cursor', 'grabbing')
//     dragging = true
// }).on('mouseup', function () {
//     $('.widget').draggable('disable')
//     $(this).css('cursor', 'grab')
//     dragging = false

// }).on('mouseenter', function () {
//     if (!dragging) $(this).css('cursor', 'grab')
// })

// $('body').on('mousemove', function () {
//     $(this).css('cursor', dragging ? 'grabbing' : 'auto')
// })

function fit(_, force) {

    if (!(force === true || $('#toggle_fit').prop('checked'))) return

    const k0 = 0.98
    const k1 = 0.9
    const calc = calc_fit()
    $('.widget').each(function () {
        $(this).outerWidth($(this).outerWidth() * calc.k_w * k0)
        $(this).outerHeight($(this).outerHeight() * calc.k_h * k1)
    })
    $('.widget').each(function () {
        const pos = $(this).position()
        $(this).css({ left: pos.left * calc.k_w * k0, top: pos.top * calc.k_h * k1 })
    })
    transl()
}

$('#bnt_fit').on('click', function () {
    fit(undefined, true)
})

function transl() {

    const offs = 10
    const hh = ($('.header').outerHeight() + $('.logo').outerHeight()) / 2 - offs

    const a = calc_fit()
    const b_w = $('body').width() / 2
    const b_h = $('body').height() / 2
    const delta = { x: (a.l + a.w / 2) - b_w, y: (a.t + a.h / 2) - b_h }
    $('.widget').each(function () {
        const pos = $(this).position()
        const l = pos.left - delta.x
        const t = pos.top - delta.y
        if (!(t <= 0 || l <= 0)) $(this).css({ left: l, top: t + hh })
    })


}

function calc_fit_t(s, t) {
    const border = 0
    let x
    if (s == 'top' || s === 'left') {
        x = Number.MAX_VALUE
        $('.widget').each(function () {
            const pos = $(this).position()
            x = Math.min(x, (s === 'top' ? pos.top : pos.left) + border)
        })
    } else {
        x = 0
        $('.widget').each(function () {
            const pos = $(this).position()
            x = Math.max(x, (s === 'height' ? pos.top + $(this).outerHeight() : pos.left + $(this).outerWidth()) - t + (2 * border))
        })
    }
    return x
}

function calc_fit() {

    const hh = $('.header').outerHeight()

    let t = calc_fit_t('top')
    let l = calc_fit_t('left')
    let h = calc_fit_t('height', t)
    let w = calc_fit_t('width', l)

    const k_w = $('body').width() / w * 0.95
    const k_h = ($('body').height() - hh) / h * 0.95

    // console.log('k_w', k_w, 'k_h', k_h)
    return { l: l, t: t, w: w, h: h, k_w: k_w, k_h: k_h }
    // return { w: w, h: h, k_w: 1.5, k_h: 1.5 }
}


// ########################################### geom ########################################################

function get_geom() {

    let geom = {}
    $('.widget').each(function (index) {
        let y = {
            pos: $(this).position(),
            height: $(this).outerHeight(),
            width: $(this).outerWidth(),
            zindex: $(this).css('z-index')
        }
        geom[this.id] = y
    })
    return geom
}

function set_geom(geom) {

    $('.widget').each(function (index) {
        const c = geom[this.id]
        // console.log(c)
        if (c) {
            $(this).css({ top: c.pos.top, left: c.pos.left })
            $(this).outerHeight(c.height)
            $(this).outerWidth(c.width)
            $(this).css('z-index', c.zindex)
        }
    })
    fit(undefined, true)
}
