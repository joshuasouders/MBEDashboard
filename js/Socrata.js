function Dataset() {
  this.host = 'http://www.socrata.com'
  this.auth = false
  this.apptoken = false
}

Dataset.prototype.setHost = function(host) {
  this.host = host
}

Dataset.prototype.setUID = function(uid) {
  this.uid = uid
}

Dataset.prototype.setAppToken = function(apptoken) {
  this.apptoken = apptoken
}

Dataset.prototype.setCredentials = function(username, password) {
  this.auth = {
    username: username,
    password: password
  }
}

// Given a string, look for a properly formatted UID.
//  returns: false on failure
Dataset.prototype.extractUID = function(url) {
  matches = url.match(/.*([a-z0-9]{4}-[a-z0-9]{4}).*/)
  if ( matches == null || matches.length < 2 ) {
    return false
  }
  this.uid = matches[1]
  return true
}

// TODO: Better protocol handling
Dataset.prototype.extractHost = function(url) {
  matches = url.match(/^(?:[^\/]+:\/\/)?([^\/]+)/im)
  if ( matches == null || matches.length < 2 ) {
    return
  }
  this.host = 'http://' + matches[1]
}

Dataset.prototype.columnsCallback = function(data) {
  this.columns = data
}

Dataset.prototype.rowsCallback = function(data) {
  this.rows = data.data
}

Dataset.prototype.jsonWrap = function(url) {
  return this.host + url
}

// Ready a string for use in JSONP callback
Dataset.prototype.jsonpWrap = function(url) {
  return this.host + url + (url.indexOf('?') == -1 ? '?' : '&') + 'jsonp=?'
}

// Where to get general information about this dataset
Dataset.prototype.viewDataURL = function() {
  var url = this.jsonWrap('/views/' + this.uid + '.json')
  if (this.apptoken) {
    url += '?$$app_token=' + this.apptoken
  }
  return url
}

// Get general information about this dataset
Dataset.prototype.viewData = function(callback) {
    var url = this.viewDataURL()
    $.ajax({
        url: url,
        json: true,
        auth: this.auth,
      success: function (error, response, body) {
        if (!error && response.statusCode == 200) {
          callback(body)
        } else {
          console.log(error)
          console.log(response.statusCode)
        }
    }})
}

// Where to get the rows JSON from
Dataset.prototype.rowsURL = function() {
  var url = this.jsonWrap('/views/' + this.uid + '/rows.json')
  if (this.apptoken) {
    url += '?$$app_token=' + this.apptoken
  }
  return url
}

Dataset.prototype.getRows = function(callback) {
  var url = this.rowsURL()
  $.ajax({
      url: url,
      json: true,
      auth: this.auth,
    success: function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body)
      } else {
        console.log(error)
        console.log(response.statusCode)
      }
  }})
}

// And the columns
Dataset.prototype.columnsURL = function() {
  var url = this.jsonWrap('/views/' + this.uid + '/columns.json')
  if (this.apptoken) {
    url += '?$$app_token=' + this.apptoken
  }
  return url
}

Dataset.prototype.getColumns = function(callback) {
  var url = this.columnsURL()
  $.ajax({
      url: url,
      json: true,
      auth: this.auth,
    success: function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body)
      } else {
        console.log(error)
        console.log(response.statusCode)
      }
  }})
}

// A short link to this dataset
Dataset.prototype.shortURL = function() {
  return this.host + '/d/' + this.uid
}

Dataset.prototype.apiURL = function() {
  var url = this.host + '/resource/' + this.uid + '.json?'
  if (this.apptoken) {
    url += '$$app_token=' + this.apptoken
  }
  return url
}

Dataset.prototype.queryURL = function(query) {
  return this.apiURL() + '&' + query
}

Dataset.prototype.query = function(query, callback) {
  var url = this.queryURL(query)
  console.log(url)
  var r = $.ajax({
    url: url,
    json: true,
    auth: this.auth,
  success: function (data) {
      callback(data)
  }})
  return r
}