import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-gl3d-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

rows = d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/clebsch-cubic.csv', function(err, rows){
	  function unpack(rows, key) {
	  	return rows.map(function(row) {return parseFloat(row[key]); });
	}
});

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			params: {
			},
			data: [
				{
						type: "isosurface",
						x: unpack(rows, 'x'),
						y: unpack(rows, 'y'),
						z: unpack(rows, 'z'),
						value: unpack(rows, 'value'),
						isomin: -100,
						isomax: 100,
						surface: {show: true, count: 1, fill: 0.8},
						slices: {z: {
							show: true, locations: [-0.3, 0.5]
						}},
						caps: {
								x: {show: false},
								y: {show: false},
								z: {show: false}
						},
				}
			],
			layout_is3d: {
				autosize: true,
				hovermode: 'closest',
				showlegend: false,
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
				scene: {
					xaxis:{title: 'Income, Y'},
					yaxis:{title: 'Capital, K'},
					zaxis:{title: 'Investment (I), Savings (S)'},
					camera: {
						center: {
							x: -0.05, y: -0.08, z: -0.2 
						}, 
						eye: { 
							x: 1.15, y: -1.45, z: 0.25 
						}, 
						up: {
							x: 0, y: 0, z: 1 
						}
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

		let partialState = Object.assign({}, this.state);
		// partialState.data[0].x = times;
		// partialState.data[0].y = x;
		// partialState.data[0].z = x;
		// partialState.data[0].value = x;

    // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
    const newLayout = Object.assign({}, this.state.layout);
    newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;

		this.setState({
			data: partialState.data,
			layout: newLayout
		})
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
	document.getElementById('root-cusp_catastrophe')
);