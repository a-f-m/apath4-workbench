import { Apath } from './apath-lib-es.js'

// a step func
function f(ctx_node) {
    return ctx_node + 1
}

const apath = new Apath()

// adding the step func
apath.step_func(f)

// get the evaluator
const evaluator = apath.transpile('a.b.f()')

// evaluate
const result = Array.from(evaluator.evaluate_json('{ "a": { "b": 1 } }'))

// show result
console.log(JSON.stringify(result)) // [2]

// or in one expression
console.log(
    JSON.stringify(
        Array.from(
            new Apath().step_func(f).transpile('a.b.f()')
                .evaluate_json('{ "a": { "b": 1 } }'))))



