/*
  * SafeCharts - From Peolpe 2 People
   * Copyright 2019 The AICC inc.
    * Very speed, efficiency and the size of the app
     * * * * * * * * * * * * * * * * * * * * * * * * */

"use strict"

// the legacy extention by https://stackoverflow.com/a/7838871
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  this.beginPath()
  this.moveTo(x+r, y)
  this.arcTo(x+w, y,   x+w, y+h, r)
  this.arcTo(x+w, y+h, x,   y+h, r)
  this.arcTo(x,   y+h, x,   y,   r)
  this.arcTo(x,   y,   x+w, y,   r)
  this.closePath()
  return this
}
// also nearly legacy "number to abbreviate number converter" by https://stackoverflow.com/a/10601315
var shortNum = function (y, hotfix=true) {
  let newValue = (hotfix)?parseInt(DEFAULTS.yAxis.showedmax/DEFAULTS.yAxis.labels*y):y
  const suffixes = ["", "K", "M", "B","T"]
  let suffixNum = 0
  while (newValue >= 1000) {
    newValue /= 1000
    suffixNum++
	}
  newValue = (newValue)?newValue.toPrecision(3):newValue
  newValue += suffixes[suffixNum]
  return newValue
}

// demo of reducing the size of the application
var yrv =(y)=> CANVAS.height-y*DEFAULTS.yAxis.scale*((CANVAS.height-DEFAULTS.xAxis.margin)/(DEFAULTS.yAxis.showedmax*DEFAULTS.yAxis.scale))
var t2d =(t)=> ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(new Date(t)).getMonth()]+' '+(new Date(t)).getDate()
var w2n =(w)=> w.replace('px','')
var n2w =(n)=> n+'px'

// mode
var mode = 'light' // night
// elements
var CNTNER,CANVAS,MAPSEL,MAPLAY,SWTCHS
var ctx,mtx
// animation
var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame
// structures
var allLines = Array()
var allDates = Array()
var showLines = Array()
var showArea = {from:0,to:0}
class Line {
  constructor(line) {
    this.name  = line.name
    this.color = line.color
    this.y  	 = line.y
    this.x  	 = line.x
  }
}
// etc
var lastClientX
var lastSelectorWidth
var mapselMode		// scroll or lscale/rscale

const DEFAULTS = {
	width: 400,
	lineJoin: 'round',
	rowHeight: 60,
	rowWidth: 60,		// dynamic
	background: '#FFF',
	text: '#343A40',
	xAxis: {
		scale: 1,
		margin: 30,
		padding: 10,
		labels: 6,
		color: '#CFCFCFCF',
		step: 1,
		leftOffset: 0,
	},
	yAxis: {
		scale: 0.0001,	// canvas scale does not work correctly((9
		margin: 30,
		padding: 10,
		labels: 6,
		color: '#ADADADAD',
		lines: 6,
		step: 60,
		showedmax: 0,
		globalmax: 0,
	},
	mapSelector: {
		border: 7.5,			// left&right for resize
		minWidth: 0,
		leftOffset: 0,
		overlay: 'rgba(137, 162, 165, 0.15)',
		background: '#ffffff90',
	},
	chartPopup: {
		circle: 5,
		background: '#FFF',
		border: '#CCC',
		line: '#CCC',
		title: '#343A40',
		overlay: 'rgba(137, 162, 165, 0.07)',
		radius: 10,
		left: 0,				// dynamic
		top: 50,
		width: 0,				// dynamic
		height: 0,			// dynamic
		padding: 15,
		between: 55,
	},
	chartSwitches: {
		border: '#cfcfcf'
	}
}

var parseBadStruct = function() {
	// included in html
	bigdata = bigdata[0]
	console.log(bigdata)
	let keys = Array()
	// bazat is a connecting link in any incomprehensible situation
	bigdata.columns.map((bazat)=>keys.push(bazat[0]))
	keys.forEach((key,i)=>{
		if(bigdata.types[key]=="line"){
			let line = Object()
			line.name  = bigdata.names[key]
			line.color = bigdata.colors[key]
			line.y  	 = bigdata.columns[i].slice(1)
			line.x  	 = allDates
			allLines[key] = new Line(line)
			showLines[key] = new Line(line)
		} else {
			allDates = bigdata.columns[i].slice(1)
			console.log(`Was loaded ${allDates.length} days`)
		}
	})
	// wow, "showLines=allLines" is not copy, is link o.O
}

var initSelectors = function() {
	CNTNER = document.getElementById("chartContainer")
	CANVAS = document.getElementById("safeChart")
	MAPSEL = document.getElementById("mapSelector")
	MAPLAY = document.getElementById("mapLayout")
	SWTCHS = document.getElementById("chartSwitches")
	DEFAULTS.width = CNTNER.getBoundingClientRect().width-30
	CANVAS.setAttribute('height', n2w(DEFAULTS.yAxis.lines * DEFAULTS.rowHeight + DEFAULTS.yAxis.margin))
	CANVAS.setAttribute('width', n2w(DEFAULTS.width))
	MAPLAY.setAttribute('width', n2w(DEFAULTS.width))
	
	Object.entries(allLines).forEach(([key, line])=>{
		let maxGlobal = Math.max(...line.y)
		if(maxGlobal>DEFAULTS.yAxis.globalmax) {
			DEFAULTS.yAxis.globalmax=Math.ceil(maxGlobal)
		}
	})
	DEFAULTS.yAxis.scale = CANVAS.height / DEFAULTS.yAxis.globalmax

	MAPSEL.style.width = n2w(MAPLAY.width/10) // n2w(DEFAULTS.rowWidth * DEFAULTS.xAxis.scale * allDates.length / CANVAS.width)
	DEFAULTS.xAxis.leftOffset = CANVAS.getBoundingClientRect().left
	DEFAULTS.mapSelector.leftOffset = MAPLAY.getBoundingClientRect().left
	DEFAULTS.mapSelector.minWidth = DEFAULTS.rowWidth * DEFAULTS.xAxis.scale * allDates.length / CANVAS.width
	ctx = CANVAS.getContext("2d")
	mtx = MAPLAY.getContext("2d")
	let chartSwitches = ""
	Object.entries(showLines).forEach(([key,line]) => {
		chartSwitches +=
			`
			<button id="${key}" onclick="switchHandler(this)" type="button" class="btn btn-default waves-effect waves-light toggle-line">
				<span><i class="fa fa-check-square" style="color:${line.color}"></i></span>
				<span class="line-name">${line.name}</span>
			</button>
			`
	})
	SWTCHS.innerHTML = chartSwitches
}

var switchHandler = function(button) {
	let id = button.id
	if (Object.keys(showLines).includes(id)) {
		delete showLines[id]
		button.querySelector(`span>i`).classList.remove('fa-check-square')
		button.querySelector(`span>i`).classList.add('fa-square-o')
	} else {
		showLines[id] = allLines[id]
		button.querySelector(`span>i`).classList.remove('fa-square-o')
		button.querySelector(`span>i`).classList.add('fa-check-square')
	}
	redrawChartLines()
	redrawMapLines()
}

var drawAxisLables = function() {
	DEFAULTS.yAxis.showedmax = 0
	DEFAULTS.yAxis.globalmax = 0
	Object.entries(showLines).forEach(([key, line])=>{
		// so that the schedule does not go beyond the workspace
		const additionalPadding = parseInt(DEFAULTS.yAxis.padding/DEFAULTS.yAxis.scale)
		let maxShowed = Math.max(...line.y.slice(showArea.from,showArea.to+2))
		if(maxShowed>DEFAULTS.yAxis.showedmax) {
			DEFAULTS.yAxis.showedmax=Math.ceil(maxShowed)+additionalPadding
		}
		let maxGlobal = Math.max(...line.y)
		if(maxGlobal>DEFAULTS.yAxis.globalmax) {
			DEFAULTS.yAxis.globalmax=Math.ceil(maxGlobal)+additionalPadding
		}
	})

	// fill the background
	ctx.fillStyle = DEFAULTS.background
	ctx.fillRect(0, 0, DEFAULTS.width, CANVAS.height)

	let rowCount = DEFAULTS.yAxis.labels
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	ctx.textBaseline = 'bottom'
	ctx.font = "1em Candara"
	ctx.fillStyle = DEFAULTS.yAxis.color

	ctx.textAlign = 'left'
	ctx.translate(0, -DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// yAxis labels (static)
	for (var i = 0; i < rowCount; i++) {
		ctx.fillText(shortNum(i), 0, CANVAS.height - rowHeight * i - DEFAULTS.yAxis.padding)
	}
	ctx.stroke()

	ctx.textAlign = 'center'
	ctx.translate(0, DEFAULTS.yAxis.margin)
	ctx.beginPath()
	// xAxis labels (dynamic)
	const visible = Math.ceil((showArea.to-showArea.from)/DEFAULTS.xAxis.labels)
	let c = 0
	for (var i = showArea.from; i < showArea.to; i++) {
		// love $this <3
		if(i&&!(i%visible)) ctx.fillText(t2d(allDates[i]), rowWidth*c, CANVAS.height - DEFAULTS.xAxis.padding)
		c++
	}
	ctx.stroke()
	
	ctx.translate(0, -DEFAULTS.yAxis.margin)
}

var drawPlotLines = function() {
	let rowCount = DEFAULTS.yAxis.labels
	let rowHeight = DEFAULTS.rowHeight
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	ctx.lineWidth = 0.5
	ctx.strokeStyle = DEFAULTS.xAxis.color
	ctx.beginPath()
	// yAxis lines
	for (var i = 0; i < rowCount; i++) {
		ctx.moveTo(0, CANVAS.height - rowHeight * i)								// 1
		ctx.lineTo(CANVAS.width, CANVAS.height - rowHeight * i)			// 2
	}
	ctx.stroke()
	// ctx.beginPath()
	// ctx.strokeStyle = '#E9E9E9E9'
	// // xAxis lines
	// let c = 0
	// for (var i = showArea.from; i < showArea.to; i++) {
	// 	// because need to think like the bottom left origin
	// 	ctx.moveTo(rowWidth*c, CANVAS.height)										// 2
	// 	ctx.lineTo(rowWidth*c, 0)																// 1
	// 	c++
	// }
	// ctx.stroke()
}

var drawChartLines = function() {
	ctx.lineWidth = 2.5
	ctx.lineJoin = DEFAULTS.lineJoin
	let rowWidth  = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	Object.entries(showLines).forEach(([key,line]) => {
		
		ctx.strokeStyle = line.color
		ctx.beginPath()
		let c = 0	//
		// i <= showArea.to // yeeeh, it's work
		for (var i = showArea.from; i <= showArea.to; i++) {
			ctx.lineTo(rowWidth*c, yrv(line.y[i]))
			c++
		}
		ctx.stroke()

		// let d = 0
		// for (var i = showArea.from; i < showArea.to; i++) {
		// 	ctx.beginPath()
		// 	ctx.arc(rowWidth*d,yrv(line.y[i]),5,0,2*Math.PI)
		// 	ctx.clearRect(rowWidth*d-5,yrv(line.y[i])-5,5*2,5*2)
		// 	ctx.stroke()
		// 	d++
		// }

	})
}
var redrawChartLines = function() {
	let step = allDates.length/MAPLAY.getBoundingClientRect().width
	// int required!!1
	showArea.from = parseInt(MAPSEL.offsetLeft*step)
	showArea.to = parseInt((MAPSEL.offsetLeft+MAPSEL.getBoundingClientRect().width)*step)
	DEFAULTS.xAxis.scale = (CANVAS.width/(showArea.to-showArea.from))/DEFAULTS.rowWidth
	const SELECTOR = MAPSEL.getBoundingClientRect()
	// render after mouseup (well, at least here the optimization was delivered)
	ctx.translate(0, DEFAULTS.yAxis.margin)
	ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
	lastClientX = SELECTOR.x
	drawAxisLables()
	drawPlotLines()
	// it's animation? oke
	requestAnimationFrame(drawChartLines)
}

var pluginteractivity = function() {
	var isTouchSupported = 'ontouchstart' in window
	var startEvent 	= isTouchSupported ? 'touchstart' : 'mousedown'
	var moveEvent 	= isTouchSupported ? 'touchmove' 	: 'mousemove'
	var endEvent 		= isTouchSupported ? 'touchend' 	: 'mouseup'
	let step = allDates.length/MAPLAY.getBoundingClientRect().width
	// int required!!1
	showArea.from = parseInt(MAPSEL.offsetLeft*step)
	showArea.to = parseInt((MAPSEL.offsetLeft+MAPSEL.getBoundingClientRect().width)*step)
	DEFAULTS.xAxis.scale = (CANVAS.width/(showArea.to-showArea.from))/DEFAULTS.rowWidth

	// selector moves around the map only xAxis
	let innerLeftOffset = 0
	let middleLeftOffset = 0
	let outerLeftOffset = 0
	lastClientX = MAPSEL.getBoundingClientRect().x
	MAPSEL.addEventListener(startEvent, mouseDown, false)
	window.addEventListener(endEvent, mouseUp, false)
	CANVAS.addEventListener('click', chartPopup, false)
	
	function mouseUp(e) {
		redrawChartLines()
		window.removeEventListener(moveEvent, move, true)
	}
	function mouseDown(e) {
		let clientX = e.clientX || e.targetTouches[0].clientX
		let border = DEFAULTS.mapSelector.border
		var SELECTOR = MAPSEL.getBoundingClientRect()
		outerLeftOffset = DEFAULTS.mapSelector.leftOffset
		middleLeftOffset = SELECTOR.left-outerLeftOffset
		innerLeftOffset = clientX - SELECTOR.left
		lastSelectorWidth = SELECTOR.width
		let isBody = (clientX>(SELECTOR.x+border))&&(clientX<(SELECTOR.x+SELECTOR.width-border))
		let isLeft = (clientX>=(SELECTOR.x))&&(clientX<=(SELECTOR.x+border))
		let isRight = (clientX>=(SELECTOR.x+SELECTOR.width-border))&&(clientX<=(SELECTOR.x+SELECTOR.width))
		if (false) bazat in miami
		else if (isBody)
			mapselMode='scroll'
		else if (isLeft)
			mapselMode='lscale'
		else if (isRight)
			mapselMode='rscale'
		window.addEventListener(moveEvent, move, true)
	}
	function move(e) {
		let clientX = e.clientX || e.targetTouches[0].clientX
		const SELECTOR = MAPSEL.getBoundingClientRect()
		const LAYOUT = MAPLAY.getBoundingClientRect()
		let dynamicOffset = clientX-outerLeftOffset-innerLeftOffset
		if (mapselMode=='lscale') {
			dynamicOffset = clientX - outerLeftOffset
			let currentWidth = middleLeftOffset - dynamicOffset + lastSelectorWidth
			if((dynamicOffset>=0)&&(currentWidth>=DEFAULTS.mapSelector.minWidth)) {
				MAPSEL.style.left = n2w(dynamicOffset)
				MAPSEL.style.width = n2w(currentWidth)
			}
		}
		if (mapselMode=='rscale') {
			let currentWidth = clientX - outerLeftOffset - middleLeftOffset
			if((dynamicOffset<=(LAYOUT.width-lastSelectorWidth))&&(dynamicOffset>=middleLeftOffset+DEFAULTS.mapSelector.minWidth-lastSelectorWidth)) {
				MAPSEL.style.width = n2w(currentWidth)
			}
		}
		if (mapselMode=='scroll') {
			if(dynamicOffset>=0&&dynamicOffset<=(LAYOUT.width-SELECTOR.width)) {
				MAPSEL.style.left = n2w(dynamicOffset)
			}
		}
	}
	function chartPopup(e) {
		let clientX = e.clientX || e.targetTouches[0].clientX
		let rowWidth = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
		let showedLocation = clientX-DEFAULTS.xAxis.leftOffset
		let showedIndex = Math.round(showedLocation/rowWidth)
		let globalIndex = showArea.from+showedIndex
		drawChartPopup(showedIndex,globalIndex)
	}

}

var drawChartPopup = function(showedIndex,globalIndex) {
	let popup = DEFAULTS.chartPopup
	let rowWidth = DEFAULTS.rowWidth*DEFAULTS.xAxis.scale
	// overlay effect
	ctx.fillStyle = DEFAULTS.chartPopup.overlay
	ctx.fillRect(0, 0, DEFAULTS.width, CANVAS.height)
	// vertical line
	ctx.lineWidth = 1.5
	ctx.strokeStyle = popup.line
	ctx.beginPath()
	ctx.moveTo(rowWidth*showedIndex, CANVAS.height)
	ctx.lineTo(rowWidth*showedIndex, popup.top+popup.radius)
	ctx.stroke()
	// lines circles
	Object.entries(showLines).forEach(([key,line]) => {
		ctx.lineWidth = 2.5
		ctx.strokeStyle = line.color
		ctx.fillStyle = DEFAULTS.background
		let circleSize = popup.circle
		ctx.beginPath()
		ctx.arc(rowWidth*showedIndex,yrv(line.y[globalIndex]),circleSize,0,2*Math.PI)
		ctx.fillRect(rowWidth*showedIndex-circleSize,yrv(line.y[globalIndex])-circleSize,circleSize*2,circleSize*2) // clearRect
		ctx.stroke()
	})
	// chart rectangle
	popup.width = popup.padding+popup.between*Object.entries(showLines).length	// popup.padding*2
	popup.height = 100
	let defaultOffset = rowWidth*showedIndex-popup.width/2
	if (false) bazat in miami
	else if(defaultOffset<0) popup.left = 0
	else if(defaultOffset>CANVAS.width-popup.width) popup.left = CANVAS.width-popup.width
	else popup.left = defaultOffset
	ctx.strokeStyle = popup.border
	ctx.fillStyle = popup.background
	ctx.lineWidth = 1.5
	ctx.roundRect(popup.left, popup.top, popup.width, popup.height, popup.radius).fill()
	ctx.roundRect(popup.left, popup.top, popup.width, popup.height, popup.radius).stroke()
	// popup title
	ctx.font = "1.1em Helvetica"
	ctx.fillStyle = popup.title
	ctx.textAlign = 'center'
	ctx.textBaseline = 'top'
	ctx.beginPath()
	// day of week? really??
	ctx.fillText(t2d(allDates[globalIndex]), popup.left+popup.width/2, popup.top+popup.padding)
	ctx.stroke()
	// popup text
	let c = 0
	Object.entries(showLines).forEach(([key,line]) => {
		ctx.font = "1.1em Helvetica"
		ctx.fillStyle = line.color
		ctx.textAlign = 'left'
		ctx.beginPath()
		ctx.fillText(shortNum(line.y[globalIndex],false), popup.left+popup.padding+popup.between*c, popup.top+popup.padding*3)
		ctx.stroke()
		ctx.font = "1em Helvetica"
		ctx.textAlign = 'left'
		ctx.beginPath()
		ctx.fillText(line.name, popup.left+popup.padding+popup.between*c, popup.top+popup.padding*4.5)
		ctx.stroke()
		c++
	})
	
}

var drawMapLines = function() {
	mtx.lineWidth = 1.5
	mtx.lineJoin = DEFAULTS.lineJoin
	Object.entries(showLines).forEach(([key,line]) => {
		mtx.strokeStyle = line.color
		mtx.beginPath()
		line.x.forEach((dot,i) => {
			let y = MAPLAY.height-line.y[i]*DEFAULTS.yAxis.scale*(MAPLAY.height/(DEFAULTS.yAxis.globalmax*DEFAULTS.yAxis.scale))
			let rowWidth = MAPLAY.width/allDates.length
			mtx.lineTo(rowWidth*i, y)
		})
		mtx.stroke()
	})
	mtx.fillStyle = DEFAULTS.mapSelector.overlay
	mtx.fillRect(0, 0, DEFAULTS.width, MAPLAY.height)
}
var redrawMapLines = function() {	
	mtx.clearRect(0, 0, MAPLAY.width, MAPLAY.height)
	// it's animation? oke
	requestAnimationFrame(drawMapLines)
}

var toogleMode = function(button) {
	if(mode=='night') { mode = 'light'
		DEFAULTS.xAxis.color = '#CFCFCFCF'
		DEFAULTS.background = '#FFF'
		DEFAULTS.text = '#343a40'
		DEFAULTS.chartSwitches.border = '#CFCFCF'
		DEFAULTS.mapSelector.background = '#ffffff90'
		DEFAULTS.mapSelector.overlay = 'rgba(137, 162, 165, 0.07)'
		DEFAULTS.chartPopup.background = '#FFF'
		DEFAULTS.chartPopup.border = '#CCC'
		DEFAULTS.chartPopup.line = '#CCC'
		DEFAULTS.chartPopup.title = '#343a40'
		DEFAULTS.chartPopup.overlay = 'rgba(137, 162, 165, 0.07)'
	} else 
	if(mode=='light') { mode = 'night'
		DEFAULTS.xAxis.color = '#1f2225'
		DEFAULTS.background = '#242f3a'
		DEFAULTS.text = '#FFF'
		DEFAULTS.chartSwitches.border = '#ADADADAD'
		DEFAULTS.mapSelector.background = '#ffffff20'
		DEFAULTS.mapSelector.overlay = 'rgba(137, 162, 165, 0.07)'
		DEFAULTS.chartPopup.background = '#242f3a'
		DEFAULTS.chartPopup.border = '#40454a'
		DEFAULTS.chartPopup.line = '#444e50'
		DEFAULTS.chartPopup.title = '#FFF'
		DEFAULTS.chartPopup.overlay = 'rgba(137, 162, 165, 0.04)'
	}

	document.getElementById("allPage").style['background-color'] = DEFAULTS.background
	document.getElementById("allPage").style['color'] = DEFAULTS.text
	MAPSEL.style['background-color'] = DEFAULTS.mapSelector.background
	// kostyle edition
	Array.from(document.getElementsByClassName("line-name")).forEach((span)=>span.style.color = DEFAULTS.text)
	Array.from(document.getElementsByClassName("toggle-line")).forEach((span)=>span.style['border-color'] = DEFAULTS.chartSwitches.border)

	redrawChartLines()
	redrawMapLines()
}
/* - - - - - - - - - -*/
parseBadStruct()
initSelectors()
pluginteractivity()
drawAxisLables()
drawPlotLines()
drawChartLines()
drawMapLines()
/* - - - - - - - - - -*/