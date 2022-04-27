import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	"a0": 0.01,
	"a1": 0.01,
	"b0": 0.01,
	"b1": 0.01,
	"b2": 0.01,
	"tfinal": 5
}

class App extends React.Component {
	constructor(props) {
		super(props);
			this.state = {
				params: {
					"a0": 10,
					"a1": -0.5,
					"b0": -2,
					"b1": -0.5,
					"b2": 0.5,
					"tfinal": 30
				},
				data: [
					{
						x: [],
						y: [],// u
						type: 'scatter',
						mode: 'lines',
						name: "unemployment",
						line: {
							color: "black"
						},
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>u: %{y:.2f}' +
							'<extra></extra>'
					},
					{
						x: [],
						y: [],
						type: 'scatter',
						mode: 'lines',
						name: 'wages',
						yaxis: 'y2',
						line: {
							color: "red"
						},
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>w: %{y:.2f}' +
							'<extra></extra>'
					},
					{
						x: [],
						y: [],
						mode: 'lines+markers',
						line: {
							dash: 'dot',
							color: 'green'
						},
						showlegend: false,
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>S=I=%{y:.2f}' +
							'<extra></extra>'
					},
					{
						x: [],
						y: [],
						mode: 'lines+markers',
						line: {
							dash: 'dot',
							color: 'green'
						},
						showlegend: false,
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>S=I=%{y:.2f}' +
							'<extra></extra>'
					}
				],
				layout: {
					autosize: true,
					showlegend: true,
					legend: {
						x: 1,
						xanchor: 'right',
						y: 0
					},
					hovermode: 'closest',
					margin: {
						l: 50,
						r: 50,
						b: 50,
						t: 50,
						pad: 4
					},
					paper_bgcolor: '#cecece',
					xaxis: {
						title: 'Time, t',
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
					range: []
					},
					yaxis: {
						title: "Unemployment, u",
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
						range: []
					},
					yaxis2: {
						title: 'Wages, w',						
						titlefont: {
								family: 'Arial, sans-serif',
								size: 18,
								color: '#333'
						},
						range: [],
						overlaying: 'y',
						side: 'right'
					}
				}
			};

			this.handleChange = this.handleChange.bind(this);
			this.computeEquilibrium = this.computeEquilibrium.bind(this);
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params,0,true);
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = parseFloat(event.target.value);
		this.setState(partialState, function() {
			this.computeEquilibrium();
		});
	}

	computeEquilibrium() {
		var params = this.state.params;

		var time = []
		var unemployment = []
		var wages = []

		var k = 1// Change to an actual initial condition

		for(let t = 0; t <= params.tfinal; t+=0.01){
			time.push(t)
			unemployment.push(-params.a0/params.a1+k/(params.a1*(1-params.a1*params.b1))*Math.exp(params.a1*params.b2/(1-params.a1*params.b1)*t))
			wages.push(k/(params.a1*params.b2)*Math.exp(params.a1*params.b2/(1-params.a1*params.b1)*t)-(params.a0+params.a1*params.b0)/(params.a1*params.b2))
		}

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = unemployment;

		partialState.data[1].x = time;
		partialState.data[1].y = wages;

		// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
		const newLayout = Object.assign({}, this.state.layout);
		newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
		newLayout.yaxis.range = [0,1.1*Math.max.apply(null,unemployment)]
		this.setState({
			data: partialState.data,
			layout: newLayout
		})
	}

	render() {
		return (
			<div id = "page-wrapper">
				<h1>Wage changes and unemployment</h1>
				<div className="row">
					<div className="block-2">
						<div id="settings">
						<h4><u>Wage unemployment relation</u></h4>
						<div className="row">
							<div className="block-4">
								<div className="entry">
									<label>
										<InlineMath math="\alpha_0" />
										<input name="a0" value={this.state.params.a0} step={steps.a0} className="entry-form" type="number" onChange={this.handleChange} />
									</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
									<label>
										<InlineMath math="\alpha_1" />
										<input name="a1" value={this.state.params.a1} step={steps.a1} className="entry-form" type="number" onChange={this.handleChange} />
									</label>
								</div>
							</div>
						</div>
						<h4><u>Unemployment / expectations parameters</u></h4>
						<div className="row">
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="\beta_0" />
											<input name="b0" value={this.state.params.b0} step={steps.b0} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="\beta_1" />
											<input name="b1" value={this.state.params.b1} step={steps.b1} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="\beta_2" />
											<input name="b2" value={this.state.params.b2} step={steps.b2} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
						</div>
						<h4><u>General Parameters</u></h4>
						<div className="row">
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="t_f" />
											<input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
						</div>
					</div>
					</div>
					<div className="block-10">
						<div id="model">
								<Plot
									data={this.state.data}
									layout={this.state.layout}
									style={{width: "100%", height: "100%"}}
									useResizeHandler={true}
								/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('root-klein_1950')
);