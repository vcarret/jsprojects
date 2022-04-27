import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-gl3d-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const x = []
const y = []
const z = []

for(let i = -5; i <= 5; i+=0.1){
	x.push(i)
	var tmp = []
	for(let j = -5; j <= 5; j+=0.1){
		y.push(j)
		// tmp.push((i+j)*(1-i))
		tmp.push(j**3-j*i)
	}
	z.push(tmp)
}


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			params: {
			},
			data: [
				{
					type: "surface",
					showscale: false,
					colorscale: [[0, 'rgb(0,0,0)'], [1, 'rgb(255,255,255)']],
					z: z,
					contours: {
						x: {
							highlight: false
						},
						z: {
							highlight: false
						}
					},
					hoverinfo: 'none',
					hovertemplate:
		        'h: %{z:.2f}' +
            '<br>a: %{y:.2f}' +
            '<br>x: %{x:.2f}' +
            '<extra></extra>'
				}
			],
			layout: {
				scene:{
					aspectmode: "manual",
					aspectratio: {
						x: 1, y: 1, z: 1,
					},
					xaxis: {
						showticklabels: false,
						nticks: 4,
						title: 'x'
					},
					yaxis: {
						showticklabels: false,
						nticks: 4,
						title: 'a',
					},
					zaxis: {
						showticklabels: false,
						nticks: 4,
						range: [-10, 10],
						title: 'h'
					},
					camera: {
						eye: {
							x: 0.75,
							y: 2.25,
							z: -0.75
						},
						up: {
							x: 1,
							y: 0,
							z: 0
						}
					},
					width: 750,
					height: 600,
					margin: {
						l: 0,
						r: 0,
						b: 0,
						t: 0,
						pad: 0
					}
				}
			}
		};

		this.computeEquilibrium = this.computeEquilibrium.bind(this);
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params);
	}

	computeEquilibrium() {
		var params = this.state.params;
		// console.log(this.state.layout_is3d) // To find best camera angles

		
	}

	render() {
		return (
			<div id = "page-wrapper">
				<h1>Cusp Catastrophe</h1>
				<div className="row">
					<div className="block-12">
						<div id="model">
							<Plot
								data={this.state.data}
								layout={this.state.layout}
								style={{width: "100%", height: "900px"}}
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
  document.getElementById('root-cusp_catastrophe')
);