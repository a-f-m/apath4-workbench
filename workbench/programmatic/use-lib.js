import { Apath } from './apath-lib-es.js'

// a step func
function f(ctx_node) {
    return ctx_node + 1
}

const apath = new Apath()

// adding the step func
apath.add_js_func(f)

// get the evaluator
const evaluator = apath.transpile('a.b.f()')

// evaluate - 'results' is an iterator over found solutions
const results = evaluator.evaluate_json('{ "a": { "b": 1 } }')
// with an object: ... evaluator.evaluate({ a: { b: 1 } })

// iterate results
for (const result of results) console.log(result) // --> 2

// only the first result (more performant due to bypassing the iterator)
console.log(evaluator.evaluate_first({ a: { b: 1 } })) // --> 2
