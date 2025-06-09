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
simple_dynprop1:
`{
    "cat": {
        "age": 8,
        "p": "age"
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
simple4:
`{
    "cat": {
        "age": 1,
        "name": "jo",
        "id": 3
    }
}`,
array:
`{"names": ["jo", "lu"]}`,
array1:
`[{"age": 1}, {"age": 2}]`,
array2:
`{"keys": [1, 2, 3]}`,
array3:
`[{"age": 1}, {"age": 9}, {"age": 11}]`,
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
        order: 0,
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
        order: 1,
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
        order: 2,
        data: {
            keyword: '**/** ... **/**',
            input: inputs.simple_litprop1,
            apath: `cat./#.*/`,
            grammar: '#main-rule-Property',
            remark: 'all properties with names conforming to a regex'
        },
        geom: geom.default
    },
    'dynamic property': {
        order: 3,
        data: {
            keyword: '**prop(** ... **)**',
            input: inputs.simple_dynprop1,
            apath: 'cat.prop(p)',
            grammar: '#main-rule-Property',
            remark: 'expression value used as the property name'
        },
        geom: geom.default
    },
    'children (array)': {
        order: 4,
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
        order: 5,
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
        order: 6,
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
    'Restriction': {
        group: true
    },
    'filter (predicate)': {
        order: 7,
        data: {
            keyword: '... **?(** ... **)**',
            input: inputs.array1,
            apath: `*?(age==1)`,
            grammar: '#main-rule-Filter'
        },
        geom: geom.default
    },
    'subscript': {
        order: 8,
        data: {
            keyword: '... **[** ... **]**',
            input: inputs.array,
            apath: `//second array item\nnames[1]`,
            // aaseq: true,
            grammar: '#main-rule-Subscript'
        },
        geom: geom.default
    },
    'value regex': {
        order: 9,
        data: {
            keyword: '**match(** ... **)**',
            input: inputs.array3,
            apath: `*?(age.match('1|2'))`,
            grammar: '#main-rule-StepFunctionCall',
            remark: 'values conforming to a regex'
        },
        geom: geom.default
    },
    'regex groups': {
        order: 10,
        data: {
            keyword: '**match(** ... **)**',
            input: inputs.array,
            apath: `names.*.match('j(o)')`,
            grammar: '#main-rule-StepFunctionCall',
            remark: 'yields a match object with groups'
        },
        geom: geom.default
    },
    'regex named groups': {
        order: 11,
        data: {
            keyword: '**match(** ... **)**',
            input: inputs.array,
            apath: `names.*.match('(?<x>.)u')`,
            grammar: '#main-rule-StepFunctionCall',
            remark: 'match object contains named groups'
        },
        geom: geom.default
    },
    'Construction': {
        group: true
    },
    'construction (object)': {
        order: 12,
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple1,
            apath: `cat.{ id: 2, '#call': name }`,
            grammar: '#main-rule-ObjectConstruction',
            remark: 'property name: identifier or string'
        },
        geom: geom.default
    },
    '... dynamic property': {
        order: 13,
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple2,
            apath: `cat.{ prop(p): 'jo' }`,
            grammar: '#main-rule-PropertyAssignment',
            remark: 'expression value used as the property name'
        },
        geom: geom.default
    },
    '... embedding': {
        order: 14,
        data: {
            keyword: '**{** ... **}**',
            input: inputs.simple4,
            apath: `cat.{ _, age: 3, id: none }`,
            grammar: '#main-rule-PropertyAssignment',
            remark: "value is embedded, here 'self' ('_'), age is newly assigned, and id is removed"
        },
        geom: geom.default
    },
    'construction (array)': {
        order: 15,
        data: {
            keyword: '**[** ... **]**',
            input: inputs.simple2,
            apath: `cat.[ 3, age ]`,
            grammar: '#main-rule-ArrayConstruction'
        },
        geom: geom.default
    },
    '... sequences': {
        order: 16,
        data: {
            keyword: '**[** ... **]**',
            input: inputs.simple3,
            apath: `cat.[ names.*, 'lu' ]`,
            grammar: '#main-rule-ArrayConstruction',
            remark: 'sequences are embedded flat. use [names.*] otherwise'
        },
        geom: geom.default
    },

    'Basic Expressions': {
        group: true
    },
    'equality': {
        order: 17,
        data: {
            keyword: '**==, !=**',
            input: inputs.simple1,
            apath: `// ==, !=\ncat.(age == 1)`,
            grammar: '#main-rule-Expression'
        },
        geom: geom.default
    },
    'relational': {
        order: 18,
        data: {
            keyword: '**<**, **>**, **<=**, **>=**',
            input: inputs.simple1,
            apath: `// <, >, <=, >=\ncat.(age < 2)`,
            grammar: '#main-rule-Expression'
        },
        geom: geom.default
    },
    'logical': {
        order: 19,
        data: {
            keyword: '**and, or, not**',
            input: inputs.simple1,
            apath: `// and, or, not\ncat.(age==1 or not age<9)`,
            grammar: '#main-rule-Expression'
        },
        geom: geom.default
    },
    'arithmetic': {
        order: 20,
        data: {
            keyword: '**+**, **-**, **&ast;**, **/**, **%**',
            input: inputs.simple1,
            apath: `// +, -, *, /, %\ncat.(age + 3 * -1)`,
            grammar: '#main-rule-Expression'
        },
        geom: geom.default
    },

    'Composite Expressions': {
        group: true
    },
    'scope expression': {
        order: 21,
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
        order: 22,
        data: {
            keyword: '**if** **(** ... **)** ... ',
            input: inputs.simple1,
            apath: `cat.(if (age < 10) age 'old')`,
            grammar: '#main-rule-OrdinaryExpression',
            remark: 'expression value depending on a condition',
            sugg: {
                insertText:
`\\(if (|||true|||\${1:_condition_})
    (|||true|||\${2:_then_part_})
    (|||true|||\${3:_else_part_})
\\)`,
                
            }
        },
        geom: geom.default
    },
    'Variables': {
        group: true
    },
    'variable reference': {
        order: 23,
        data: {
            keyword: '**$** ...',
            input: inputs.simple,
            grammar: '#main-rule-VariableReference',
            apath: `$root.cat`,
            remark: `e.g. predefined variable 'root' for the input`
        },
        geom: geom.default
    },
    'variable assignment': {
        order: 24,
        data: {
            keyword: '... **=** ...',
            input: inputs.simple,
            grammar: '#main-rule-VariableAssignment',
            remark: 'usual assignment of values',
            apath: 
//----------------------------
`toLive = 15 - cat.age,
$toLive`
//----------------------------
        },
        "geom": geom.default,
    },
    '... memoizing nodes': {
        order: 25,
        data: {
            keyword: '... **=** ...',
            input: inputs.var1,
            input_nl: true,
            grammar: '#main-rule-VariableAssignment',
            remark: 'a node is bound to a variable, referenced in subsequent paths',
            apath: 
//----------------------------
// `cat @child
//     .mom
//     .('gave birth at age '
//         + (age - $child.age))`
`cat.(child=_,
     mom.('gave birth at age '
          + (age - $child.age)))`
//----------------------------
        },
        "geom": geom.default,
    },
    '... joins': {
        order: 26,
        data: {
            keyword: '... **=** ...',
            input: inputs.var2,
            input_nl: true,
            grammar: '#main-rule-VariableAssignment',
            remark: `"joins" with variables storing sequences`,
            apath: 
//----------------------------
// `cats = cats.*, dogs = dogs.*,
// $cats @c
//     .$dogs ?(_ != $c) @d
//         .($c + ' loves ' + $d)`
`cats = cats.*, dogs = dogs.*,
$cats.(cat=_,       
       $dogs ?(_ != $cat).
        ($cat + ' loves ' + _))`

// cats = cats.*, dogs = dogs.*,
// $cats @c .$dogs @d.
//    (if ($c != $d) $c + ' loves ' + $d)
//----------------------------
        },
        "geom": geom.default,
    },

    'Step Functions': {
        group: true
    },

    'reusable expressions': {
        order: 27,
        data: {
            keyword: '**func** <id>**(**...**)** = ...',
            input: inputs.simple1,
            grammar: '#main-rule-StepFunctionDefinition',
            remark: `simple expressions over the context node`,
            apath: 
//----------------------------
`func plus(k) = _ + $k,
cat.age.plus(10)`
//----------------------------
        },
        "geom": geom.default,
    },

    'constructive function': {
        order: 28,
        data: {
            keyword: '**func** <id>**(**...**)** = ...',
            input: inputs.simple1,
            grammar: '#main-rule-StepFunctionDefinition',
            remark: `constructions over the context node; 'name' relative to it`,
            apath: 
//----------------------------
`func callName(x) = { id: $x, '#call': name },
cat.callName(2)`
//----------------------------
        },
        "geom": geom.default,
    },



    'recursive function': {
        order: 29,
        data: {
            keyword: '**func** <id>**(**...**)** = ...',
            input: inputs.simple1,
            grammar: '#main-rule-StepFunctionDefinition',
            remark: `with global and local variables`,
            apath: 
//----------------------------
`to = 5,
func recIncr(x) = (
    y = $x + 1,
    if ($y == $to) $y recIncr($y)), 
cat.recIncr(age)`
//----------------------------
        },
        "geom": geom.default,
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

    'Step Functions header': {header: 
`

### Javascript Step Functions (user defined)

| category | remark | keyword/<br>symbol<br>(-pattern) [[1](#1)] | apath | input [[1](#1)] | result | grammar/<br>workbench [[2](#2)] | step functions |
| - | - | - | - | - | - | - | - |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp; | &nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
`        
    },
    'JS Step Functions': {
        group: true
    },
    'simple step function': {
        order: 30,
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
        order: 31,
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
        order: 32,
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
