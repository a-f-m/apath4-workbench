var data_dyn = 
function () {
    
    var geom = {
        sfuncs: {
          "widget_input": {
            "pos": {
              "top": 101.28334045410156,
              "left": 47.68333435058594
            },
            "height": 382.367,
            "width": 623.4,
            "zindex": "104"
          },
          "widget_apath": {
            "pos": {
              "top": 101.28334045410156,
              "left": 691.4666748046875
            },
            "height": 312.083,
            "width": 642.483,
            "zindex": "102"
          },
          "widget_result": {
            "pos": {
              "top": 431.66668701171875,
              "left": 691.8499755859375
            },
            "height": 239.05,
            "width": 642.483,
            "zindex": "101"
          },
          "widget_sfuncs": {
            "pos": {
              "top": 501.8500061035156,
              "left": 47.68333435058594
            },
            "height": 168.817,
            "width": 623.4,
            "zindex": "103"
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
  "inventory": [
      {
          "date": "2024-10-01",
          "items": [
              {
                  "category": "electronic",
                  "name": "pc",
                  "price": 45.78,
                  "quantity": 1
              },
              {
                  "category": "furniture",
                  "name": "table",
                  "price": 100.10,
                  "quantity": 2
              }
          ]
      },
      {
          "date": "2024-10-05",
          "items": [
              {
                  "category": "furniture",
                  "name": "table",
                  "price": 100.10,
                  "quantity": 3
              },
              {
                  "category": "furniture",
                  "name": "chair",
                  "price": 200.50,
                  "quantity": 1
              }
          ]
      }
  ]
}`
}
    
var sfuncs = {
simple:
`[
  function sum(ctx_node, seq) {
    let sum = 0
    if (!apart.isApathIterable(seq)) return seq
    // float rounding error not avoidable in js, function planned
    for (const x of seq) sum += x
    return sum
  }
]`
}
    
    var examples = {
      "first_example": {
        "value": "price sum"
      },
      "financial": {
        group: true
      },
      "price sum": {
        "data": {
          "input": inputs.simple,
          "apath":
//---
`// Sum of the prices of inventory furniture after a date
sum(
  inventory.*
    ? (date > "2024-10-04")
      .items.*
        ? (category == "furniture")
          .(price * quantity)
)`,
//---
          "sfuncs": sfuncs.simple,
        },
        "geom": geom.sfuncs
      },
      "price sum with comments": {
        "data": {
          "input": inputs.simple,
          "apath":
//---
`sum(
  // all inventory states
  inventory.*
    // filtered by date 
    ? (date > "2024-10-04")
      // their items
      .items.*
        // filtered by category 
        ? (category == "furniture")
          // their prices
          .(price * quantity)
)`,
//---
          "sfuncs": sfuncs.simple,
        },
        "geom": geom.sfuncs
      },

      "flat list": {
        "data": {
          "input": inputs.simple,
          "apath":
//---
`// flat list of inventory item strings.
// if I introduce variables (after order.*, coming soon ;), 
// the date can be stored and used in an row
[
    inventory.*.items.*
        .(name + ': ' + price + '€ ' + '(' + category + ')')
]`,
//---
          // "sfuncs": sfuncs.simple,
        },
        "geom": geom.default
      }

    }


    
    return examples
    
}
