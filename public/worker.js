var messages = {
  start: (e) => {
    var update = () => {
      updateUsage((usage) => {
        postMessage({ message: 'progressbars', data: updateProgressbars(usage) })
      })
    }
    update()
    setInterval(update, 60 * 60 * 1000)
  },
  updateUsage: (e) => {
    updateUsage((usage) => {
      postMessage({ message: 'usage', data: usage })
    })
  },
  updateProgressbars: (e) => {
    postMessage({ message: 'progressbars', data: updateProgressbars(e.data) })
  }
}

onmessage = (e) => {
  messages[e.data.message](e)
}

function updateUsage(cb) {
  var xhr = new XMLHttpRequest()

  xhr.onload = function(e) {
    var usage = {
      progressbars: []
    }
    usage.data = JSON.parse(xhr.responseText)
    usage.blocksUsed = Math.ceil(-(usage.data.dumLimit - usage.data.dumUsage) / 50)
    cb(usage)
  }

  xhr.open('GET', '/usage.json')
  xhr.send()
}

function updateProgressbars(usage) {
  var includedLimit = Number(usage.data.dumLimit)
  var includedUsage = usage.data.dumUsage > includedLimit ? includedLimit : Number(usage.data.dumUsage)
  var trueUsage = Number(usage.data.dumUsage)

  usage.progressbars[0] = {
    name: 'INCLUDED WITH YOUR PLAN',
    limit: includedLimit,
    limitStr: `${includedLimit} GB`,
    usage: includedUsage,
    usageStr: `${includedUsage} GB`,
    style: 'height: 128px; text-align: center; background-color: #777777;',
    innerStyle: `width: ${Math.floor((includedUsage / includedLimit) * 100)}%;`,
    labelStyle: 'position: absolute; left: 0; right: 0; line-height: 128px; color: white;',
    active: usage.blocksUsed == 0
  }

  var title = ' xocF'
  title = `[${includedUsage}/${includedLimit}]` + title

  for (var i = 0; i < usage.blocksUsed; i++) {
    var blockLimit = 50
    var blockUsage = trueUsage - includedLimit - (i * blockLimit) > 50 ? 50 : trueUsage - includedLimit - (i * blockLimit)

    usage.progressbars[i + 1] = {
      name: `SUPPLEMENTAL BLOCK ${i + 1}`,
      limit: blockLimit,
      limitStr: `${blockLimit} GB`,
      usage: blockUsage,
      usageStr: `${blockUsage} GB`,
      style: 'height: 32px; text-align: center; background-color: #777777;',
      innerStyle: `width: ${Math.floor((blockUsage / blockLimit) * 100)}%; animation-direction: reverse;`,
      labelStyle: 'position: absolute; left: 0; right: 0; line-height: 32px; color: white;',
      active: usage.blocksUsed == i + 1
    }

    title = `[${blockUsage}/${blockLimit}]` + title
  }

  usage.title = title

  return usage
}