import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	"sy": 0.01,
	"sr": 0.01,
	"sp": 0.01,
	"sbar": 5,
	"iy": 0.01,
	"ir": 0.01,
	"ibar": 5,
	"ystar": 10,
	"y": 10,
	"p": 1
}

class App extends React.Component {
	constructor(props) {
		super(props);
			this.state = {
				params: {
					"sy": 0.2,
					"sr": 0.75,
					"sp": 0.5,
					"sbar": -40,
					"iy": 0.15,
					"ir": -1.6,
					"ibar": 20,
					"ystar": 500,
					"y": 500,
					"p": 100
				},
				data: [
					{
						x: [],
						y: [],// I
						type: 'scatter',
						mode: 'lines',
						name: "I",
						xaxis: 'x',
						yaxis: 'y',
						line: {
							color: "#ab3bf2"
						},
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>I: %{y:.2f}' +
							'<extra></extra>'
					},
					{
						x: [],
						y: [],// S
						type: 'scatter',
						mode: 'lines',
						name: "S",
						xaxis: 'x',
						yaxis: 'y',
						line: {
							color: "4dbc52",
						},
						hovertemplate: 
							'y: %{x:.0f}' +
							'<br>S: %{y:.2f}' +
							'<extra></extra>'
					},
					{
						x: [],
						y: [],
						mode: 'lines+markers',
							xaxis: 'x',
							yaxis: 'y',
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
							xaxis: 'x',
							yaxis: 'y',
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
								y: [],// is
								type: 'scatter',
								mode: 'lines',
								name: "IS",
								xaxis: 'x2',
								yaxis: 'y2',
								line: {
									color: "red"
								},
								hovertemplate: 
									'y: %{x:.0f}' +
									'<br>r: %{y:.2f}' +
									'<extra></extra>'
						},
						{
							x: [],
							y: [],
							mode: 'lines+markers',
								xaxis: 'x2',
								yaxis: 'y2',
							line: {
								dash: 'dot',
								color: 'green'
							},
							showlegend: false,
								hovertemplate: 
									'y: %{x:.0f}' +
									'<br>r: %{y:.2f}' +
									'<extra></extra>'
						},
						{
							x: [],
							y: [],
							mode: 'lines+markers',
								xaxis: 'x2',
								yaxis: 'y2',
							line: {
								dash: 'dot',
								color: 'green'
							},
							showlegend: false,
								hovertemplate: 
									'y: %{x:.0f}' +
									'<br>r: %{y:.2f}' +
									'<extra></extra>'
						},
						{
							x: [],
							y: [],
							mode: 'lines+markers',
								xaxis: 'x',
								yaxis: 'y',
							line: {
								dash: 'dot',
								color: 'grey'
							},
							showlegend: false,
								hovertemplate: 
									'y: %{x:.0f}' +
									'<br>r: %{y:.2f}' +
									'<extra></extra>'
						},
						{
							x: [],
							y: [],
							mode: 'lines+markers',
								xaxis: 'x2',
								yaxis: 'y2',
							line: {
								dash: 'dot',
								color: 'grey'
							},
							showlegend: false,
								hovertemplate: 
									'y: %{x:.0f}' +
									'<br>r: %{y:.2f}' +
									'<extra></extra>'
						}
				],
				layout: {
					autosize: true,
					showlegend: false,
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
						domain: [0,0.45],
						title: 'Investment, I; Savings, S',
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
					range: []
					},
					yaxis: {
						anchor: "x",
						title: "Interest rate, r",
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
						range: []
					},
					xaxis2: {
						domain: [0.55,1],
						title: 'Income, y',
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
						range: []
					},
					yaxis2: {
						anchor: "x2",
						title: "Interest rate, r",
						titlefont: {
									family: 'Arial, sans-serif',
									size: 18,
									color: '#333'
							},
						range: []
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

	computeEquilibrium(shock = 0, first = false) {
		var params = this.state.params;

		var inv = []
		var sav = []
		var interest_rate = []
		var is_curve = []

		var r_star = 1/(params.ir-params.sr)*((params.sy-params.iy)*params.ystar+params.sbar+params.sp*params.p-params.ibar)
		var r_eq = 1/(params.ir-params.sr)*((params.sy-params.iy)*params.y+params.sbar+params.sp*params.p-params.ibar)
		var inv_eq = params.ir*r_eq+params.iy*params.y+params.ibar
		var inv_star = params.ir*r_star+params.iy*params.ystar+params.ibar

		for(let r = -10; r <= 10; r+=0.01){
			interest_rate.push(r)
			inv.push(params.ir*r+params.iy*params.y+params.ibar)
			sav.push(params.sr*r+params.sy*params.y+params.sp*params.p+params.sbar)
			is_curve.push(1/(params.sy-params.iy)*((params.ir-params.sr)*r+(params.ibar-params.sbar-params.sp*params.p)))
		}

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = inv;
		partialState.data[0].y = interest_rate;

		partialState.data[1].x = sav;
		partialState.data[1].y = interest_rate;

		partialState.data[2].x = [0,inv_eq];
		partialState.data[2].y = [r_eq,r_eq];

		partialState.data[3].x = [inv_eq,inv_eq];
		partialState.data[3].y = [0,r_eq];

		partialState.data[4].x = is_curve;
		partialState.data[4].y = interest_rate;

		partialState.data[5].x = [0,params.y];
		partialState.data[5].y = [r_eq,r_eq];		

		partialState.data[6].x = [params.y,params.y];
		partialState.data[6].y = [0,r_eq];

		partialState.data[7].x = [inv_star,inv_star];
		partialState.data[7].y = [-10,10];

		partialState.data[8].x = [params.ystar,params.ystar];
		partialState.data[8].y = [-10,10];	

		// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
		const newLayout = Object.assign({}, this.state.layout);
		newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
		newLayout.xaxis.range = [0,1.1*Math.max.apply(null,inv)]
		newLayout.xaxis2.range = [0,2*params.ystar]
		newLayout["annotations"] = [
			{
				x: params.ystar,
				y: 5,
				xref: 'x2',
				yref: 'y2',
				text: 'Full employment <br>income, y*',
				showarrow: true,
				arrowhead: 7,
				ax: 60,
				ay: -40
			},{
				x: inv_star,
				y: 5,
				xref: 'x',
				yref: 'y',
				text: 'Full employment <br>investment and savings',
				showarrow: true,
				arrowhead: 7,
				ax: 60,
				ay: -40
			}
		]
		this.setState({
			data: partialState.data,
			layout: newLayout
		})
	}

	render() {
		return (
			<div id = "page-wrapper">
				<h1>Investment, savings and the interest rate</h1>
				<div className="row">
					<div className="block-2">
						<div id="settings">
						<h4><u>Savings parameters</u></h4>
						<div className="row">
							<div className="block-3">
								<div className="entry">
									<label>
										<InlineMath math="S_y" />
										<input name="sy" value={this.state.params.sy} step={steps.sy} className="entry-form" type="number" onChange={this.handleChange} />
									</label>
								</div>
							</div>
							<div className="block-3">
								<div className="entry">
									<label>
										<InlineMath math="S_r" />
										<input name="sr" value={this.state.params.sr} step={steps.sr} className="entry-form" type="number" onChange={this.handleChange} />
									</label>
								</div>
							</div>
							<div className="block-3">
								<div className="entry">
											<label>
												<InlineMath math="S_p" />
												<input name="sp" value={this.state.params.sp} step={steps.sp} className="entry-form" type="number" onChange={this.handleChange} />
											</label>
									</div>
							</div>
							<div className="block-3">
								<div className="entry">
											<label>
												<InlineMath math="\bar S" />
												<input name="sbar" value={this.state.params.sbar} step={steps.sbar} className="entry-form" type="number" onChange={this.handleChange} />
											</label>
									</div>
							</div>
						</div>
						<h4><u>Investment parameters</u></h4>
						<div className="row">
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="I_y" />
											<input name="iy" value={this.state.params.iy} step={steps.iy} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="I_r" />
											<input name="ir" value={this.state.params.ir} step={steps.ir} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="\bar{I}" />
											<input name="ibar" value={this.state.params.ibar} step={steps.ibar} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
						</div>
						<h4><u>Income and prices</u></h4>
						<div className="row">
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="y^*" />
											<input name="ystar" value={this.state.params.ystar} step={steps.ystar} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="y" />
											<input name="y" value={this.state.params.y} step={steps.y} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
							<div className="block-4">
								<div className="entry">
										<label>
											<InlineMath math="p" />
											<input name="p" value={this.state.params.p} step={steps.p} className="entry-form" type="number" onChange={this.handleChange} />
										</label>
								</div>
							</div>
						</div>
					</div>
						<div id="equations">
				    	<h4><u>Equations:</u></h4>
							<div className="row">
								<div className="block-12">
								    <InlineMath math="I(r,Y)=I_r r + I_y y + \bar I" />

								    <InlineMath math="S(r,Y)=S_r r + S_y y + S_p p + \bar S" />
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
	document.getElementById('root-klein_1944')
);