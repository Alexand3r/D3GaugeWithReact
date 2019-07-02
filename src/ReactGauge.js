import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3'

const draw = (props) => {

	var barWidth, chart, chartInset, degToRad, /* repaintGauge, */
		height, margin, /* numSections, */ padRad, percToDeg, percToRad,
		percent, radius, svg, totalPercent, width, arcStartRad,
		arcEndRad, max, min; /* sectionPerc */
	min = props.min;
	max = props.max;
	percent = props.value;
	// numSections = 1;
	// sectionPerc = 1 / numSections / 2;
	padRad = 0.025;
	chartInset = 10;

	// Orientation of gauge:
	totalPercent = .75;
	let el = d3.select('.gauge')

	margin = {
		top: 20,
		right: 8,
		bottom: 30,
		left: 8
	};
	width = el['_groups'][0][0].offsetWidth;
	height = el['_groups'][0][0].offsetHeight;
	radius = Math.min(width, height) / 2;
	barWidth = 40 * width / 300;
	let labels = props.labels

	/*
    Utility methods 
  */
	percToDeg = function (perc) {
		return perc * 360;
	};

	percToRad = function (perc) {
		return degToRad(percToDeg(perc));
	};

	degToRad = function (deg) {
		return deg * Math.PI / 180;
	};

	// Create SVG element
	svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).attr('position', 'relative');

	// Add layer for the panel
	chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left + margin.right) / 2) + ", " + ((height - margin.top) / 2) + ")");
	chart.append('path').attr('class', "arc chart-filled");
	if (props.dGauge) {
		chart.append('path').attr('class', "arc chart-filled-2")
	}
	chart.append('path').attr('class', "arc chart-empty");
	let valueDesc, valueLabel;
	if (labels) {
		valueLabel = svg.append("text")
			.attr('dominant-baseline', "middle")
			.attr("x", "50%")
			.attr("y", "50%")
			.attr("text-anchor", 'middle')
			.attr('class', props.classes ? props.classes.label : "small-label")
			// .text(props.value)
			.attr('font-family', "Roboto")
			.attr('font-size', "16px");
		valueDesc = svg.append("text")
			.attr("x", "50%")
			.attr("y", "40%")
			.attr('dominant-baseline', "middle")
			.attr("text-anchor", 'middle')
			.attr('class', props.classes ? props.classes.label : "label")
			// .text(props.value)
			.attr('font-family', "Roboto")
			.attr('font-size', "24px");
	}



	let primaryArc, arcEmpty, secondaryArc;
	primaryArc = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
	arcEmpty = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
	secondaryArc = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

	var Chart = (function () {
		function Chart(el) {
			this.el = el
		}
		function value2percent(value) {
			console.log('Value', value)
			console.log(value > 0 ? ((((value - min) * 100) / (max - min)) / 100) : 0)
			return value > 0 ? (((value - min) * 100) / (max - min)) / 100 : 0
		}
		Chart.prototype.repaintGauge = function (value, prevValue) {
			var next_start = totalPercent;
			arcStartRad = percToRad(next_start);
			arcEndRad = arcStartRad + percToRad(value / 2);
			let arcEndRad2 = arcStartRad + percToRad(prevValue / 2);

			primaryArc.startAngle(arcStartRad).endAngle(arcEndRad);
			secondaryArc.startAngle(arcStartRad).endAngle(arcEndRad2);

			if (value > prevValue) {
				next_start += value / 2;
				arcStartRad = percToRad(next_start);
				arcEndRad = arcStartRad + percToRad((1 - value) / 2);
			}
			else {
				next_start += prevValue / 2;
				arcStartRad = percToRad(next_start);
				arcEndRad = arcStartRad + percToRad((1 - prevValue) / 2);
			}

			arcEmpty.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

			this.el.select(".chart-filled").attr('d', primaryArc);
			this.el.select(".chart-empty").attr('d', arcEmpty);
			this.el.select(".chart-filled-2").attr('d', secondaryArc);
		};
		Chart.prototype.moveTo = function (value, oldValue, value2, oldValue2, txt, prev) {
			let perc = value2percent(value)
			let perc2 = value2percent(value2)
			let oldPerc = value2percent(oldValue)
			let oldPerc2 = value2percent(oldValue2)
			// this.repaintGauge(perc, perc2)
			console.log('Perc', perc, "Value", value)
			var self = this
			if (labels) {
				valueLabel.text(parseFloat(prev ? value2 : value).toFixed(3))
				valueDesc.text(txt)
			}
			this.el.transition().duration(400).select('.chart-filled').tween('progress', function () {
				return function (percentOfPercent) {
					var progress = d3.interpolate(oldPerc, perc)(percentOfPercent)
					var progress2 = d3.interpolate(oldPerc2, perc2)(percentOfPercent)
					self.repaintGauge(progress, progress2);
				};
			});


		}
		return Chart
	})()

	let ch = new Chart(chart);
	return ch
}
function ReactGauge(props) {
	let gauge = useRef()
	let oldValue = useRef(props.value)
	let oldPrevValue = useRef(props.dGauge ? 0 : props.prevValue)
	let prevProps = useRef(props)
	const [prevSee, setPrevSee] = useState(!props.dGauge)
	useEffect(() => {
		if (props !== prevProps.current) {
			if (gauge.current) {
				if (prevSee) {
					gauge.current.moveTo(props.value, oldValue.current, props.prevValue, oldPrevValue.current, props.prevLabel, true)
					oldValue.current = props.value
					oldPrevValue.current = props.prevValue
				}
				else {
					gauge.current.moveTo(props.value, oldValue.current, 0, oldPrevValue.current, props.label, false)
					oldValue.current = props.value
					oldPrevValue.current = 0
				}
			}
		}
		if (props.value !== undefined && !gauge.current) {
			gauge.current = draw({ value: props.value, oldValue: oldValue.current, prevValue: 0, prevOldValue: 0, ...props, min: 0, max: 100 })
			gauge.current.moveTo(props.value, oldValue.current, 0, oldPrevValue.current, props.label, false)
		}

	}, [prevSee, props])


	return (

		<div className={'gauge'} onClick={() => {
			setPrevSee(!prevSee)
		}} />

	)
}

export default ReactGauge
