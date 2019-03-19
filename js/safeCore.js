/*
  * SafeCharts v0.0.1
   * Copyright 2019 The AICC inc.
    * Very speed, efficiency and the size of the app.
     * * * * * * * * * * * * * * * * * * * * * * * * */

"use strict"

const generalConst = 'bazat'
const DEFAULTS = {
	xAxis: {
		offset: 30,
		padding: 10,
		// lines: dynamic
	},
	yAxis: {
		offset: 30,
		padding: 0,
		labels: 6,
		lines: 6,
	},
	lineJoin: 'round',
	rowHeight: 60
}

var drawAxisLables = function() {
	let rowCount = DEFAULTS.yAxis.labels
	let colCount = 6 // calc
	let rowHeight = DEFAULTS.rowHeight
	ctx.font = "1em Candara"
	ctx.fillStyle = '#ADADADAD'

	ctx.textAlign = 'left'
	ctx.translate(0, -DEFAULTS.yAxis.offset)
	ctx.beginPath()
	// yAxis labels (static)
	for (var i = 0; i < rowCount; i++) {
		ctx.fillText(rowHeight * i, 0, CANVAS.height - rowHeight * i)
	}
	ctx.stroke()

	ctx.textAlign = 'center'
	ctx.translate(DEFAULTS.xAxis.offset, DEFAULTS.yAxis.offset)
	ctx.beginPath()
	// xAxis labels (dynamic)
	for (var i = 1; i <= colCount; i++) {
		ctx.fillText(`Mar ${i}`, rowHeight * i, CANVAS.height - DEFAULTS.xAxis.padding)
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.offset)
}

var drawPlotLines = function() {
	let rowCount = DEFAULTS.yAxis.labels
	let colCount = 6 // calc
	let rowHeight = DEFAULTS.rowHeight
	ctx.lineWidth = 0.5
	ctx.strokeStyle = '#CFCFCFCF'
	ctx.beginPath()
	// xAxis labels
	for (var i = 0; i < colCount; i++) {
		ctx.moveTo(0, CANVAS.height - rowHeight * i)								// 1
		ctx.lineTo(CANVAS.height, CANVAS.height - rowHeight * i)		// 2
	}
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = '#E9E9E9E9'
	// yAxis labels
	for (var i = 0; i <= rowCount; i++) {
		// because need to think like the bottom left origin
		ctx.moveTo(rowHeight * i, CANVAS.height)										// 2
		ctx.lineTo(rowHeight * i, 0)																// 1
	}
	ctx.stroke()
}

var drawTempChart = function() {
	ctx.lineWidth = 2.5
	ctx.strokeStyle = '#C99898'
	ctx.lineJoin = DEFAULTS.lineJoin
	ctx.beginPath()
	ctx.moveTo(0, 	rev(80))
	ctx.lineTo(60, 	rev(340))
	ctx.lineTo(120, rev(210))
	ctx.lineTo(180, rev(290))
	ctx.lineTo(240, rev(200))
	ctx.lineTo(300, rev(40))
	ctx.lineTo(360, rev(260))
	ctx.lineTo(400, rev(190))
	ctx.stroke()
}

var rev =(y)=> CANVAS.height-y

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

const CANVAS = document.getElementById("safeChart")
CANVAS.setAttribute('height', `${DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.offset}px`)
CANVAS.setAttribute('width', `500px`)
var ctx = CANVAS.getContext("2d")
// included in html
// bigdata = bigdata[0]
// console.log(bigdata)


// draw some labels
drawAxisLables()
// draw some lines
drawPlotLines()
// draw the rest of the chart
drawTempChart()

// function timeConverter(UNIX_timestamp){
//   var a = new Date(UNIX_timestamp * 1000);
//   var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//   var year = a.getFullYear();
//   var month = months[a.getMonth()];
//   var date = a.getDate();
//   var hour = a.getHours();
//   var min = a.getMinutes();
//   var sec = a.getSeconds();
//   var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
//   return time;
// }
// console.log(timeConverter(0));