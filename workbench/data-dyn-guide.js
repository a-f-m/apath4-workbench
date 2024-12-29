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
running:
`{
  "flatOwner": {
    "name": "Miller",
    "age": 28,
    "location": "Berlin, Germany",
    "#post-code": 12205,
    "mobility": {
      "driverLic": true,
      "car": "transporter"
    },
    "favorites": [ "Coen", "Dylan", "Nietzsche" ]
  },
  "inventory": [
    {
      "date": "2023-10-05",
      "items": [
        {
          "category": "furniture",
          "name": "chair",
          "price": 50.00,
          "quantity": 3
        }
      ]
    },
    {
      "date": "2024-10-01",
      "items": [
        {
          "category": "electronic",
          "name": "pc",
          "price": 1800.78,
          "quantity": 1
        },
        {
          "category": "furniture",
          "name": "table",
          "price": 100.10,
          "quantity": 1
        }
      ]
    }
  ]
}`,
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
}

var examples = {
    "first_example": {
        "value": "properties"
    },

    'Selection': {
        group: true
    },
    'properties': {
        data: {
            input: inputs.running,
            apath: 'flatOwner.(name + `#post-code`)',
            grammar: '#main-rule-Property',
        },
        geom: geom.default
    },
    'multiple properties': {
        data: {
            input: inputs.running,
            apath: 'flatOwner./name|#.*/',
            grammar: '#main-rule-Property',
        },
        geom: geom.default
    },
    'array items': {
        data: {
            input: inputs.running,
            apath: 'flatOwner.favorites.*',
            grammar: '#main-rule-Children',
        },
        geom: geom.default
    },
    'property values': {
        data: {
            input: inputs.running,
            apath: 'flatOwner.mobility.*',
            grammar: '#main-rule-Children',
        },
        geom: geom.default
    },

    'Restriction': {
        group: true
    },

    'filter': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`inventory.*?(date < '2024-10-04').
    items.*?(category == 'furniture').
        (price * quantity)
`
//-----------------------
            ,
            grammar: '#main-rule-Filter',
        },
        geom: geom.default
    },

    'regex match': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`inventory.*.
  (
    d = date,
    _?(date.match('\\\\d{4}-10-\\\\d{2}')).
      items.*.
        (quantity + ' ' + name + ': '
         + (price*quantity) + '€ '
         + '(' + $d + ')'
        )
  )
`
//-----------------------
            ,
            grammar: '#main-rule-StepFunctionCall',
        },
        geom: geom.default
    },


    'regex groups': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`flatOwner.location.match('(.*), (.*)').
  ('city: ' + groups[1] + ', country: ' + groups[2])
`
//-----------------------
            ,
            grammar: '#main-rule-StepFunctionCall',
        },
        geom: geom.default
    },

    'Construction': {
        group: true
    },

    'object construction': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`inventory.*.
  (
    d = date,
    _?(date.match('\\\\d{4}-10-\\\\d{2}')).
      items.*.
        {
          date: $d,
          // only non-id properties must be quoted
          'total price': price*quantity
        }
  )
`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-ObjectConstruction',
        },
        geom: geom.default
    },

    'dynamic name / embedding': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`flatOwner.
  {
    (name): {
      _,
      name: none,
      location: location.match('.*, (.*)').groups[1],
      mobility: none,
      favorites: none
    }
  }
`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-PropertyAssignment',
        },
        geom: geom.default
    },

    'classical merge': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`{
  flatOwner.mobility,
  inventory[0].items[0]
}
`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-PropertyAssignment',
        },
        geom: geom.default
    },

    'conditional embedding': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`flatOwner.mobility.{ if (driverLic) _ }`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-PropertyAssignment',
        },
        geom: geom.default
    },

    'nested conditional': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`heavyCar = (flatOwner.mobility.car == 'transporter'),
{
  transport: [
    inventory.*.items.*
      ?(
        q = quantity,
        if ($heavyCar)
            (category == 'furniture' and $q > 1)
            (category != 'furniture')
      )
  ]
}
`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-ConditionalExpression',
        },
        geom: geom.default
    },

    'join': {
        data: {
            input: inputs.running,
            apath:
//-----------------------
`preferred = ['chair', 'pc'].*,
items = inventory.*.items.*,
[
  $preferred.(
      p=_,
      $items ?(name == $p))
]
`
//-----------------------
            ,
            with_comments: true,
            grammar: '#main-rule-VariableAssignment',
        },
        geom: geom.default
    },

}

    return examples
    
}
