/*
  * SafeCharts
   * Copyright 2019 The AICC inc.
    * Very speed, efficiency and the size of the app.
     * * * * * * * * * * * * * * * * * * * * * * * * */

"use strict"

// project pride
var rev =(y)=> (CANVAS.height-y*DEFAULTS.scale)
var t2d =(t)=> ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(new Date(t)).getMonth()]+' '+(new Date(t)).getDate()


// included in html
bigdata = bigdata[0]
console.log(bigdata)
var xAxisLabels = bigdata.columns[0].slice(1)
var yAxisData = bigdata.columns[1].slice(1)
// console.log(yAxisData)


// const generalConst = 'bazat'
const DEFAULTS = {
	scale: 0.0001,	// canvas scale does not work correctly((9
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
	let colCount = xAxisLabels.length
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
	for (var i = 0; i < colCount; i++) {
		ctx.fillText(t2d(xAxisLabels[i]), rowHeight * i, CANVAS.height - DEFAULTS.xAxis.padding)
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.offset)
}

var drawPlotLines = function() {
	let rowCount = DEFAULTS.yAxis.labels
	let colCount = xAxisLabels.length
	let rowHeight = DEFAULTS.rowHeight
	ctx.lineWidth = 0.5
	ctx.strokeStyle = '#CFCFCFCF'
	ctx.beginPath()
	// yAxis lines
	for (var i = 0; i < rowCount; i++) {
		ctx.moveTo(0, CANVAS.height - rowHeight * i)								// 1
		ctx.lineTo(CANVAS.width, CANVAS.height - rowHeight * i)			// 2
	}
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = '#E9E9E9E9'
	// xAxis lines
	for (var i = 0; i < colCount; i++) {
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
	yAxisData.forEach((dot,i) => (!i)?ctx.moveTo(CANVAS.width*i/yAxisData.length, rev(dot)):ctx.lineTo(CANVAS.width*i/yAxisData.length, rev(dot)));
	ctx.stroke()
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

const CANVAS = document.getElementById("safeChart")
CANVAS.setAttribute('height', `${DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.offset}px`)
CANVAS.setAttribute('width', `500px`)
var ctx = CANVAS.getContext("2d")


// draw some labels
drawAxisLables()
// draw some lines
drawPlotLines()
// draw the rest of the chart
drawTempChart()
