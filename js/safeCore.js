/*!
	* SafeCharts v0.0.1
	* Copyright 2019 The AICC inc.
  * Very speed, efficiency and the size of the app.
  */

"use strict"

const generalConst = 'bazat'

var drawPlotLines = function() {
	let localConst = generalConst.length + 1
	let lineHeight = 10 * localConst
	ctx.lineWidth = 0.5
	ctx.strokeStyle = '#CFCFCFCF'
	ctx.beginPath()
	for (var i = 1; i <= localConst; i++) {
		ctx.moveTo(0, lineHeight * i)
		ctx.lineTo(400, lineHeight * i)
	}
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = '#E9E9E9E9'
	for (var i = 1; i <= localConst; i++) {
		ctx.moveTo(lineHeight * i, 0)
		ctx.lineTo(lineHeight * i, 400)
	}
	ctx.stroke()
}

var drawAxisLables = function() {
	let localConst = generalConst.length + 1
	let lineHeight = 10 * localConst
	let yAxisPadding = { bottom: 5}
	let xAxisPadding = { top: 20}
	ctx.font = "1em Candara"
	ctx.textAlign = 'left'
	ctx.fillStyle = '#ADADADAD'
	ctx.beginPath()
	for (var i = 1; i <= localConst; i++) {
		ctx.fillText(lineHeight * i, 0, lineHeight * i - yAxisPadding.bottom)
	}
	ctx.textAlign = 'center'
	for (var i = 1; i <= localConst; i++) {
		ctx.fillText(`Mar ${i}`, lineHeight * i, 400 - xAxisPadding.top)
	}
	ctx.stroke()
}

var drawTempChart = function() {
	ctx.lineWidth = 2.5
	ctx.strokeStyle = '#C99898'
	ctx.beginPath()
	ctx.moveTo(0, 80)
	ctx.lineTo(60, 340)
	ctx.lineTo(120, 210)
	ctx.lineTo(180, 290)
	ctx.lineTo(240, 200)
	ctx.lineTo(300, 40)
	ctx.lineTo(360, 260)
	ctx.lineTo(400, 190)
	ctx.stroke()
}

var ctx = document.getElementById("safeChart").getContext("2d")

// draw some lines
drawPlotLines()
// draw some labels
drawAxisLables()
// draw the rest of the chart
drawTempChart()
