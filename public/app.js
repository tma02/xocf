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

worker.onmessage = (e) => {
  app.usage = e.data.data
  document.title = e.data.data.title
}

window.onload = () => {
  worker.postMessage({ message: 'start' })
}
