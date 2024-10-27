var data_dyn =
function () {
    
    var geom = {
        sfuncs: {
            "widget_input": {
              "pos": {
                "top": 91.60000610351562,
                "left": 63.133331298828125
              },
              "height": 390.217,
              "width": 566.267,
              "zindex": "103"
            },
            "widget_apath": {
              "pos": {
                "top": 91.60000610351562,
                "left": 647.9166870117188
              },
              "height": 340.8,
              "width": 583.6,
              "zindex": "102"
            },
            "widget_result": {
              "pos": {
                "top": 452.3666687011719,
                "left": 648.2666625976562
              },
              "height": 261.05,
              "width": 583.6,
              "zindex": "101"
            },
            "widget_sfuncs": {
              "pos": {
                "top": 501.70001220703125,
                "left": 63.133331298828125
              },
              "height": 211.65,
              "width": 566.267,
              "zindex": "104"
            }
          },
        default : {
            "widget_input": {
              "pos": {
                "top": 79.81666564941406,
                "left": 66.60000610351562
              },
              "height": 508.167,
              "width": 597.383,
              "zindex": "103"
            },
            "widget_apath": {
              "pos": {
                "top": 79.80000305175781,
                "left": 683.36669921875
              },
              "height": 332.95,
              "width": 615.7,
              "zindex": "102"
            },
            "widget_result": {
              "pos": {
                "top": 432.1166687011719,
                "left": 683.7166748046875
              },
              "height": 255.067,
              "width": 615.7,
              "zindex": "101"
            },
            "widget_sfuncs": {
              "pos": {
                "top": 607.3499755859375,
                "left": 66.60000610351562
              },
              "height": 79.8167,
              "width": 597.383,
              "zindex": "104"
            }
          }
    }
    
var inputs = {
    simple:
`{
    "a": {
        "b": 1
    } 
}`,
    simple_litprop:
`{
    "a": {
        "#b": 2
    } 
}`,
    simple_litprop1:
`{
    "a": {
        "#b1": 1,
        "#b2": 2
    } 
}`,
    simple1:
`{
    "a": {
        "b": 1,
        "c": 2
    } 
}`,
    simple2:
`{
    "a": {
        "b": 1,
        "c": "y"
    } 
}`,
    simple3:
`{
    "a": {
        "b": [2, 3]
    } 
}`,
array:
`{"a": [1, 2, 3]}`,
array1:
`[{"a": 1}, {"a": 2}]`
}
    
var sfuncs = {
simple:
`[
    // 'ctx_node' (context node) is the object passed 
    // from the previous step - followed by parameters
    function add(ctx_node, k) {
        return typeof ctx_node === 'number' && typeof k === 'number' ?
                ctx_node + k : undefined
                // 'undefined' stops evaluation with no solution
    }
]`,
seq_par:
`[
    function sum(ctx_node, seq) {
        let sum = 0
        if (!apart.isApathIterable(seq)) return seq
        for (const x of seq) sum += x
        return sum
    }
]`,
seq_return:
`[
    // a sequence is returned by using a generator. in general an iterable
    function* to(ctx_node, k) {
        for (let i = ctx_node; i <= k; i++) yield i
    }
]`,
log:
`[
    function logg(ctx_node) {
        console.log(ctx_node)
    }
]`,
}

// !!! attention: following header properties has to start with column 1 cause otherwise no correct cheat sheet is generated

var examples = {
"first_example": {
    "value": "property"
},

"basic": {header: 
`
### Basic Functionality

| category | remark | keyword/<br>symbol<br>(-pattern) [[1](#1)] | apath | input [[1](#1)] | result | grammar/<br>workbench [[2](#2)] | 
| - | - | - | - | - | - | - | 
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp; |
`        
    },
    "Basic Steps": {
        group: true
    },
    "property": {
        "data": {
            "keyword": '<id>',
            "input": inputs.simple,
            "apath": `a.b`,
            "grammar": '#main-rule-Property'
        },
        "geom": geom.default
    },
    "property literal": {
        "data": {
            "keyword": "**`` ` ``** ... **`` ` ``**",
            "input": inputs.simple_litprop1,
            "apath": 'a.`#b1`',
            "grammar": '#main-rule-Property',
            "remark": "non-identifier properties names"
        },
        "geom": geom.default
    },
    "property regex": {
        "data": {
            "keyword": '**/** ... **/**',
            "input": inputs.simple_litprop1,
            "apath": `a./#.*/`,
            "grammar": '#main-rule-Property',
            "remark": "all properties with names conforming to a regex"
        },
        "geom": geom.default
    },
    "children (array)": {
        "data": {
            "keyword": '**\\***',
            "input": inputs.array,
            "apath": `a.*`,
            "grammar": '#main-rule-Children',
            "remark": "all array items"
        },
        "geom": geom.default
    },
    "children (object)": {
        "data": {
            "keyword": '**\\***',
            "input": inputs.simple1,
            "apath": `a.*`,
            "grammar": '#main-rule-Children',
            "remark": "all property values"
        },
        "geom": geom.default
    },
    "self": {
        "data": {
            "keyword": '**_** \\| **self**',
            "input": inputs.simple1,
            // "apath": `// current context node\n// '_' or 'self'\ncity.id?(_==1)`
            "apath": `a._`,
            "grammar": '#main-rule-Self',
            "remark": "current context node ('_' or 'self')"
        },
        "geom": geom.default
    },
    "Basic Steps / Construction": {
        group: true
    },
    "construction (object)": {
        "data": {
            "keyword": '**{** ... **}**',
            "input": inputs.simple2,
            "apath": `a.{ x: 2, '#1': b }`,
            "grammar": '#main-rule-ObjectConstruction',
            "remark": "property name: identifier or string. property value: literal or expression"
        },
        "geom": geom.default
    },
    "... dynamic property": {
        "data": {
            "keyword": '**{** ... **}**',
            "input": inputs.simple2,
            "apath": `a.{ (c): b }`,
            "grammar": '#main-rule-PropertyAssignment',
            "remark": "property name: parenthesized expression evaluated to string"
        },
        "geom": geom.default
    },
    "... embedding": {
        "data": {
            "keyword": '**{** ... **}**',
            "input": inputs.simple2,
            "apath": `a.{ _, c: 'z' }`,
            "grammar": '#main-rule-PropertyAssignment',
            "remark": "property expression (here self; c will be newly assigned)"
        },
        "geom": geom.default
    },
    "construction (array)": {
        "data": {
            "keyword": '**[** ... **]**',
            "input": inputs.simple2,
            "apath": `a.[ 3, b ]`,
            "grammar": '#main-rule-ArrayConstruction'
        },
        "geom": geom.default
    },
    "... sequences": {
        "data": {
            "keyword": '**[** ... **]**',
            "input": inputs.simple3,
            "apath": `a.[ 1, b.*, 4 ]`,
            "grammar": '#main-rule-ArrayConstruction',
            "remark": "sequences are embedded flat. use [b.*] otherwise"
        },
        "geom": geom.default
    },
    "Composite Steps": {
        group: true
    },
    "filter (predicate)": {
        "data": {
            "keyword": '... **?(** ... **)**',
            "input": inputs.array1,
            "apath": `*?(a==1)`,
            "grammar": '#main-rule-Filter'
        },
        "geom": geom.default
    },
    "subscript": {
        "data": {
            "keyword": '... **[** ... **]**',
            "input": inputs.array,
            "apath": `a[1]`,
            "grammar": '#main-rule-Subscript',
            "remark": "second array item"
        },
        "geom": geom.default
    },

    "Basic Expressions": {
        group: true
    },
    "equality": {
        "data": {
            "keyword": '**==, !=**',
            "input": inputs.simple1,
            "apath": `// ==, !=\na.(b == c)`,
            "grammar": '#basic-expressions'
        },
        "geom": geom.default
    },
    "relational": {
        "data": {
            "keyword": '**<**, **>**, **<=**, **>=**',
            "input": inputs.simple1,
            "apath": `// <, >, <=, >=\na.(b < c)`,
            "grammar": '#basic-expressions'
        },
        "geom": geom.default
    },
    "logical": {
        "data": {
            "keyword": '**and, or, not**',
            "input": inputs.simple1,
            "apath": `// and, or, not\na.(b == c or not c < 2)`,
            "grammar": '#basic-expressions'
        },
        "geom": geom.default
    },
    "arithmetic": {
        "data": {
            "keyword": '**+**, **-**, **&ast;**, **/**, **%**',
            "input": inputs.simple1,
            "apath": `// +, -, *, /, %\na.(b + 3 * -c)`,
            "grammar": '#basic-expressions'
        },
        "geom": geom.default
    },

    "Composite Expressions": {
        group: true
    },
    "sequenced": {
        "data": {
            "keyword": '... **,** ... ',
            "input": inputs.simple1,
            "apath": `a.(b.logg(), c)`,
            "sfuncs": sfuncs.log,
            "grammar": '#main-rule-Expression',
            "remark": "evaluates sequentially and returns value of last expression. see step functions also",
        },
        "geom": geom.sfuncs
    },
    "conditional": {
        "data": {
            "keyword": '**if** **(** ... **)** ... ',
            "input": inputs.simple1,
            "apath": `// try a.b=0 at input\na.(if (b == 1) b c)`,
            "grammar": '#main-rule-ConditionalExpression',
            "remark": "expression value depending on a condition"
        },
        "geom": geom.default
    },
    // "union": {
    //     "data": {
    //         "keyword": '... **\\|** ... ',
    //         "input": inputs.simple1,
    //         "apath": `// try a.b: 0\na.(if (b==1) b c)`,
    //         "grammar": '#main-rule-ConditionalExpression'
    //     },
    //     "geom": geom.default
    // },

    "Step Functions header": {header: 
`

### Javascript Step Functions (user defined)

| category | remark | keyword/<br>symbol<br>(-pattern) [[1](#1)] | apath | input [[1](#1)] | result | grammar/<br>workbench [[2](#2)] | step functions |
| - | - | - | - | - | - | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp; | &nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
`        
    },
    "Step Functions": {
        group: true
    },
    "simple step function": {
        "data": {
            "keyword": '<id>**(** ... **)**',
            "input": inputs.simple,
            "apath": `a.b.add(1)`,
            "sfuncs": sfuncs.simple,
            "grammar": '#main-rule-StepFunctionCall'
            // "no_stript_input": true,
        },
        "geom": geom.sfuncs
    },
    "with sequences as parameters": {
        "data": {
            "keyword": '<id>**(** ... **)**',
            "input": inputs.array,
            "apath": 
`// sequence expressions as parameters
sum(a.*)`,
            "sfuncs": sfuncs.seq_par,
            "grammar": '#main-rule-StepFunctionCall'
        },
        "geom": geom.sfuncs
    },
    "returning sequences": {
        "data": {
            "keyword": '<id>**(** ... **)**',
            "input": inputs.simple,
            "apath": `a.b.to(3)`,
            "sfuncs": sfuncs.seq_return,
            "grammar": '#main-rule-StepFunctionCall'
        },
        "geom": geom.sfuncs
    },
    // "step function w/ iteration": {
    //     "data": {
    //         "keyword": '<id>()',
    //         "input": inputs.movie1,
    //         "apath": `director.movies().award`,
    //     },
    //     "geom": default_geom
    // }

}

    return examples
    
}
