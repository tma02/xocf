let express = require('express')
let cookieParser = require('cookie-parser')
let app = express()
let request = require('request')
let cookie = require('cookie')
let config = require('./config.json')

app.use(cookieParser())

app.use(express.static('public'))

app.get('/usage.json', appGetUsage)

app.listen(3000)
console.log('Started HTTP server')

let usage = {}

function getCoxCookies(config, cb) {
  console.log('Logging into Cox...')
  let form = {
    onsuccess: 'https%3A%2F%2Fwww.cox.com%2Finternet%2Fmydatausage.cox',
    onfailure: 'https://webcdn.cox.com/content/dam/cox/residential/login.html?onsuccess=https%3A%2F%2Fwww.cox.com%2Finternet%2Fmydatausage.cox&',
    username: config.username,
    password: config.password,
    'targetFN': 'COX.net',
    emaildomain: '@cox.net',
    rememberme: 'on'
  }
  let cookies = {}
  request.post({ url: 'https://idm.east.cox.net/idm/coxnetlogin', form: form }, (err, res, body) => {
    for (let i in res.headers['set-cookie']) {
      let coxCookie = cookie.parse(res.headers['set-cookie'][i])
      cookies[Object.keys(coxCookie)[0]] = coxCookie[Object.keys(coxCookie)[0]]
    }
    cb(cookies)
  })
}

function getCoxUsage(cookies) {
  console.log('Updating utag data from Cox...')
  let options = {
    url: 'https://www.cox.com/internet/mydatausage.cox',
    headers: {
      'Cookie': '',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://webcdn.cox.com/content/dam/cox/residential/login.html?onsuccess=https%3A%2F%2Fwww.cox.com%2Finternet%2Fmydatausage.cox&onfailure=http%3A%2F%2Fwww.cox.comhttps%3A%2F%2Fwebcdn.cox.com%2Fcontent%2Fdam%2Fcox%2Fresidential%2Flogin.html'
    }
  }
  for (let i in cookies) {
    options.headers['Cookie'] += `${i}=${encodeURI(cookies[i])}; `
  }
  //console.log(options)
  request.get(options, (err, res, body) => {
    let utagRegex = /var utag_data={.*[\s\S]+?}/g
    usage = JSON.parse(utagRegex.exec(body)[0].substr(14))
    console.log('Got new utag data')
  })
}

function appGetUsage(req, res) {
  res.send(JSON.stringify(usage))
}

getCoxCookies(config, getCoxUsage)

setInterval(() => {
  getCoxCookies(config, getCoxUsage)
}, 60 * 60 * 1000)
