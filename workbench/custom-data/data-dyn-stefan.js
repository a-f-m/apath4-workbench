// ?unhide-topic=topic-stefan&topic=topic-stefan

var data_dyn =
  function () {

    var geom = {
      sfuncs: {
        "widget_input": {
           "pos": {
              "top": 102.51666259765625,
              "left": 42.81666564941406
           },
           "height": 238.583,
           "width": 559.85,
           "zindex": "103"
        },
        "widget_apath": {
           "pos": {
              "top": 102.51666259765625,
              "left": 620.8333129882812
           },
           "height": 320.117,
           "width": 577.017,
           "zindex": "102"
        },
        "widget_result": {
           "pos": {
              "top": 441.25,
              "left": 621.1666870117188
           },
           "height": 245.233,
           "width": 577.017,
           "zindex": "101"
        },
        "widget_sfuncs": {
           "pos": {
              "top": 359.683349609375,
              "left": 42.81666564941406
           },
           "height": 326.75,
           "width": 559.85,
           "zindex": "104"
        }
     },
      default: {
        "widget_input": {
          "pos": {
            "top": 102.51666259765625,
            "left": 42.81666564941406
          },
          "height": 488.583,
          "width": 559.85,
          "zindex": "101"
        },
        "widget_apath": {
          "pos": {
            "top": 102.51666259765625,
            "left": 620.8333129882812
          },
          "height": 320.117,
          "width": 577.017,
          "zindex": "104"
        },
        "widget_result": {
          "pos": {
            "top": 441.25,
            "left": 621.1666870117188
          },
          "height": 245.233,
          "width": 577.017,
          "zindex": "102"
        },
        "widget_sfuncs": {
          "pos": {
            "top": 609.683349609375,
            "left": 42.81666564941406
          },
          "height": 76.75,
          "width": 559.85,
          "zindex": "103"
        }
      }
    }

    var inputs = {
      pendulum:
//------
`{
  "id": "febf27bd-5569-4c1b-a418-c1ace882594a:0",
  "time": "2024-03-19T10:05:42.993Z",
  "type": "clock.ticked",
  "source": "clock",
  "specversion": "1.0",
  "data": {
      "time": 0
  }
}`,
//------

      transform:
//------
`{
  "specversion": "1.0",
  "id": "8",
  "source": "btire",
  "type": "pressure.updated",
  "data": {
    "time": "1970-01-01T07:00:00Z",
    "front": 1.93,
    "rear": 4.12
  }
}`
//------


    }

    var sfuncs = {
      avg:
//------
`// these functions will be standard functions in future
[
  // "free" functions ('ctx_node' not used)
  // may be extra declaration form in future
  function min(ctx_node, ...nums) {
     return Math.min(...nums)
  },
  function max(ctx_node, ...nums) {
     return Math.max(...nums)
  },
  function average(ctx_node, ...nums) {
     return nums.reduce(
        (sum, currentValue) => sum + currentValue, 0) / nums.length
  }
]`
//------
    }

    var examples = {
      first_example: {
        value: "pendulum"
      },

      pendulum: {
        data: {
          grammar: '#main-rule-PropertyAssignment',
          input: inputs.pendulum,
          apath:
//------
`// pressing 'grammar' shows related doc section
// Rem.: more xpath-aligned test (date.time...), search for 'Boolean Evaluation' in doc - 'if': see doc ;)
{
   _,   // embedding of input ('_' is the context, '$' in jsonata)
   'source': 'sirios.pendulum', 
   'type':
      (if (data.time % 2 != 0)
         'pendulum.left'
         'pendulum.right')
}`
//------
        },
        geom: geom.default
      },

      filter: {
        data: {
          grammar: '#main-rule-Filter',
          input: inputs.transform,
          apath:
//------
`_?(data.front < 4.0 or data.rear < 4.0)`
//------
        },
        geom: geom.default
      },

      converter: {
        data: {
          grammar: '#main-rule-StepFunctionCall',
          input: inputs.transform,
          sfuncs: sfuncs.avg,
          apath:
//------
`// compare next example 'converter compact'
{
   _, 
   'data': { 
      'time': data.time, 
      'min': min(data.front, data.rear),
      'max': max(data.front, data.rear), 
      'avg': average(data.front, data.rear)
   }    
}`
//------
        },
        geom: geom.sfuncs
      },

      'converter compact': {
        data: {
          grammar: '#main-rule-StepFunctionCall',
          input: inputs.transform,
          sfuncs: sfuncs.avg,
          apath:
//------
`// passing 'data' as context to avoid repetition
{ 
  _, 
  'data': 
     data.{ 
        'time': time, 
        'min': min(front, rear),
        'max': max(front, rear), 
        'avg': average(front, rear)
     }    
}`
//------
        },
        geom: geom.sfuncs
      }

    }



    return examples

  }
