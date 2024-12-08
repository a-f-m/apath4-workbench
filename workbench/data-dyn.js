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
        sfuncs1 : {
            "widget_input": {
                "pos": {
                   "top": 105.78334045410156,
                   "left": 44.16667175292969
                },
                "height": 360.583,
                "width": 577.383,
                "zindex": "103"
            },
            "widget_apath": {
                "pos": {
                    "top": 105.78334045410156,
                    "left": 640.433349609375
                },
                "height": 341.117,
                "width": 595.05,
                "zindex": "102"
            },
            "widget_result": {
                "pos": {
                    "top": 466.8833312988281,
                    "left": 640.7999877929688
                },
                "height": 261.3,
                "width": 595.05,
                "zindex": "101"
            },
            "widget_sfuncs": {
                "pos": {
                    "top": 486.3666687011719,
                    "left": 44.16667175292969
                },
                "height": 241.85,
                "width": 577.383,
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
    "cat": {
        "age": 1
    }
}`,
simple_litprop:
`{
    "cat": {
        "#id": 22
    }
}`,
simple_litprop1:
`{
    "cat": {
        "#key": 8,
        "#id": 7
    }
}`,
simple1:
`{
    "cat": {
        "age": 1,
        "name": "jo"
    }
}`,
simple2:
`{
    "cat": {
        "age": 1,
        "p": "name"
    }
}`,
simple3:
`{
    "cat": {
        "names": ["jo", "miau"]
    }
}`,
array:
`{"names": ["jo", "lu"]}`,
array1:
`[{"age": 1}, {"age": 2}]`,
array2:
`{"keys": [1, 2, 3]}`,
var1:
`{ "cat": {
    "mom": {"age": 5},
    "age": 2 
}}`,
var2:
`{ 
  "cats": ["jo", "lu"],
  "dogs": ["bay", "jo"]
}`
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
        return true
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
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp; |
`        
    },
    'Selection': {
        group: true
    },
    'property': {
        data: {
            keyword: '<id>',
            input: inputs.simple,
            apath: `cat.age`,
            grammar: '#main-rule-Property',

            input_nl: false,
            apath_nl: false
        },
        geom: geom.default
    },
    'property literal': {
        data: {
            keyword: '**`` ` ``** ... **`` ` ``**',
            input: inputs.simple_litprop1,
            apath: 'cat.`#id`',
            grammar: '#main-rule-Property',
            remark: 'non-identifier properties names'
        },
        geom: geom.default
    },
    'property regex': {
        data: {
            keyword: '**/** ... **/**',
            input: inputs.simple_litprop1,
            apath: `cat./#.*/`,
            grammar: '#main-rule-Property',
            remark: 'all properties with names conforming to a regex'
        },
        geom: geom.default
    },
    'children (array)': {
        data: {
            keyword: '**\\***',
            input: inputs.array,
            apath: `names.*`,
            grammar: '#main-rule-Children',
            remark: 'all array items'
        },
        geom: geom.default
    },
    'children (object)': {
        data: {
            keyword: '**\\***',
            input: inputs.simple1,
            apath: `cat.*`,
            grammar: '#main-rule-Children',
            remark: 'all property values'
        },
        geom: geom.default
    },
    'self': {
        data: {
            keyword: '**_** \\| **self**',
            input: inputs.simple1,
            // apath: `// current context node\n// '_' or 'self'\ncity.id?(_==1)`
            apath: `cat._`,
            grammar: '#main-rule-Self',
            remark: "current context node ('_' or 'self')"
        },
        geom: geom.default
    },
    'Construction': {
        group: true
    },
    'construction (object)': {
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple2,
            apath: `cat.{ id: 2, '#call': p }`,
            grammar: '#main-rule-ObjectConstruction',
            remark: 'property name: identifier or string'
        },
        geom: geom.default
    },
    '... dynamic property name': {
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple2,
            apath: `cat.{ (p): 'jo' }`,
            grammar: '#main-rule-PropertyAssignment',
            remark: 'property name: parenthesized expression evaluated to string'
        },
        geom: geom.default
    },
    '... embedding': {
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple2,
            apath: `cat.{ _, age: 3 }`,
            grammar: '#main-rule-PropertyAssignment',
            remark: "value is embedded, here 'self' ('_'), and age is newly assigned"
        },
        geom: geom.default
    },
    'construction (array)': {
        data: {
            keyword: '**[** ... **]**',
            input: inputs.simple2,
            apath: `cat.[ 3, age ]`,
            grammar: '#main-rule-ArrayConstruction'
        },
        geom: geom.default
    },
    '... sequences': {
        data: {
            keyword: '**[** ... **]**',
            input: inputs.simple3,
            apath: `cat.[ names.*, 'lu' ]`,
            grammar: '#main-rule-ArrayConstruction',
            remark: 'sequences are embedded flat. use [names.*] otherwise'
        },
        geom: geom.default
    },
    'Restriction': {
        group: true
    },
    'filter (predicate)': {
        data: {
            keyword: '... **?(** ... **)**',
            input: inputs.array1,
            apath: `*?(age==1)`,
            grammar: '#main-rule-Filter'
        },
        geom: geom.default
    },
    'subscript': {
        data: {
            keyword: '... **[** ... **]**',
            input: inputs.array,
            apath: `//second array item\nnames[1]`,
            grammar: '#main-rule-Subscript'
        },
        geom: geom.default
    },
    'value regex': {
        data: {
            keyword: '**match(** ... **)**',
            input: inputs.array,
            apath: `names.*.match('j(o)')`,
            grammar: '#main-rule-StepFunctionCall',
            remark: 'yields a match object with groups'
        },
        geom: geom.default
    },
    'value regex named': {
        data: {
            keyword: '**match(** ... **)**',
            input: inputs.array,
            apath: `names.*.match('(?<x>.)u')`,
            grammar: '#main-rule-StepFunctionCall',
            remark: 'match object contains named groups'
        },
        geom: geom.default
    },

    'Basic Expressions': {
        group: true
    },
    'equality': {
        data: {
            keyword: '**==, !=**',
            input: inputs.simple1,
            apath: `// ==, !=\ncat.(age == 1)`,
            grammar: '#basic-expressions'
        },
        geom: geom.default
    },
    'relational': {
        data: {
            keyword: '**<**, **>**, **<=**, **>=**',
            input: inputs.simple1,
            apath: `// <, >, <=, >=\ncat.(age < 2)`,
            grammar: '#basic-expressions'
        },
        geom: geom.default
    },
    'logical': {
        data: {
            keyword: '**and, or, not**',
            input: inputs.simple1,
            apath: `// and, or, not\ncat.(age==1 or not age<9)`,
            grammar: '#basic-expressions'
        },
        geom: geom.default
    },
    'arithmetic': {
        data: {
            keyword: '**+**, **-**, **&ast;**, **/**, **%**',
            input: inputs.simple1,
            apath: `// +, -, *, /, %\ncat.(age + 3 * -1)`,
            grammar: '#basic-expressions'
        },
        geom: geom.default
    },

    'Composite Expressions': {
        group: true
    },
    'sequenced': {
        data: {
            keyword: '... **,** ... ',
            input: inputs.simple1,
            apath: `cat.(age.logg(), age)`,
            sfuncs: sfuncs.log,
            grammar: '#main-rule-Expression',
            remark: 'evaluates sequentially and returns value of last expression',
        },
        geom: geom.sfuncs
    },
    'conditional': {
        data: {
            keyword: '**if** **(** ... **)** ... ',
            input: inputs.simple1,
            apath: `cat.(if (name=='jo') age '?')`,
            grammar: '#main-rule-OrdinaryExpression',
            remark: 'expression value depending on a condition'
        },
        geom: geom.default
    },
//          'Node Variables': {
//              group: true
//          },
//          'variable reference': {
//              data: {
//                  keyword: '**$** ...',
//                  input: inputs.simple,
//                  grammar: '#main-rule-VariableReference',
//                  apath: `$root.cat`,
//                  remark: `e.g. predefined variable 'root' for the input`
//              },
//              geom: geom.default
//          },
//          'variable binding 1': {
//              data: {
//                  keyword: '... **@** ...',
//                  input: inputs.var1,
//                  input_nl: true,
//                  grammar: '#main-rule-NodeVariableBinding',
//                  remark: 'a node is bound to a variable, referenced in subsequent expressions',
//                  apath: 
//      //----------------------------
//      // cat 
//      //   .(mom.age - age) as k
//      //   .('gave birth: ' + $k)
//      // `cat as child
//      //   .mom 
//      //   .('gave birth: '
//      //       + (age - $child.age))`
//      // `cat as child .mom
//      //   .('gave birth: '
//      //       + (age - $child.age))`
//      // `child=nil,
//      // cat@child.mom
//      //   .('gave birth: '
//      //       + (age - $child.age))`
//      `child = cat,
//      cat.mom
//        .('gave birth: '
//            + (age - $child.age))`
//      //----------------------------
//              },
//              "geom": geom.default,
//          },
//          'variable binding 2': {
//              data: {
//                  keyword: '... **@** ...',
//                  input: inputs.var2,
//                  input_nl: true,
//                  grammar: '#main-rule-NodeVariableBinding',
//                  remark: `'nested loop' with variables in sequenced expressions`,
//                  apath: 
//      //----------------------------
//      // `cats .* as cat,
//      // dogs .* as dog,
//      // if ($cat != $dog)
//      //    $cat + ' loves ' + $dog`
//      // `cats.*$cat,
//      // dogs.*$dog,
//      // if ($cat != $dog)
//      //    $cat + ' loves ' + $dog`
//      `cat=nil, dog=nil,
//      cats.*@cat, dogs.*@dog,
//      if ($cat != $dog)
//         $cat + ' loves ' + $dog`
//      //----------------------------
//              },
//              "geom": geom.default,
//          },
    // "union": {
    //     "data": {
    //         "keyword": '... **\\|** ... ',
    //         "input": inputs.simple1,
    //         "apath": `// try a.b: 0\na.(if (b==1) b c)`,
    //         "grammar": '#main-rule-ConditionalExpression'
    //     },
    //     "geom": geom.default
    // },

    'Step Functions header': {header: 
`

### Javascript Step Functions (user defined)

| category | remark | keyword/<br>symbol<br>(-pattern) [[1](#1)] | apath | input [[1](#1)] | result | grammar/<br>workbench [[2](#2)] | step functions |
| - | - | - | - | - | - | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp; | &nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
`        
    },
    'Step Functions': {
        group: true
    },
    'simple step function': {
        data: {
            keyword: '<id>**(** ... **)**',
            input: inputs.simple,
            apath: `cat.age.add(1)`,
            sfuncs: sfuncs.simple,
            grammar: '#main-rule-StepFunctionCall'
            // no_stript_input: true,
        },
        geom: geom.sfuncs1
    },
    'with sequences as parameters': {
        data: {
            keyword: '<id>**(** ... **)**',
            input: inputs.array2,
            apath: 
`// sequence expressions as parameters
sum(keys.*)`,
            sfuncs: sfuncs.seq_par,
            grammar: '#main-rule-StepFunctionCall'
        },
        geom: geom.sfuncs
    },
    'returning sequences': {
        data: {
            keyword: '<id>**(** ... **)**',
            input: inputs.simple,
            apath: `cat.age.to(3)`,
            sfuncs: sfuncs.seq_return,
            grammar: '#main-rule-StepFunctionCall'
        },
        geom: geom.sfuncs
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
