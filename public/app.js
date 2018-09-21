var app = new Vue({
  el: '#app',
  data: {
    usage: {
      data: {},
      progressbars: []
    }
  }
})

var worker = new Worker('worker.js')

function centerApp() {
  var top = (window.innerHeight / 2) - (document.getElementById('app').offsetHeight / 2)
  console.log(top)
  if (top < 24) {
    top = 24
  }
  document.getElementById('app').style.marginTop = `${top}px`
}

worker.onmessage = (e) => {
  app.usage = e.data.data
  document.title = e.data.data.title

  app.$nextTick(centerApp)
}

window.onresize = centerApp

window.onload = () => {
  worker.postMessage({ message: 'start' })
}
