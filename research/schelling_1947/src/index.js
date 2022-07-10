import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 10,
	alpha: 0.05,
	beta: 0.05,
	init_shock: 0.5
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 50,
				alpha: 0.8,
				beta: 0.15,
				init_shock: 2
	    	},
			selectedOption: 'permanent',
	    	data: [
	    		{
	    			x: [],
		            y: [],// Income
		            type: 'scatter',
		            mode: 'lines',
		            name: "Income",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>Y: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		        	mode: 'lines+markers',
		        	line: {
		        		dash: 'dot',
		        		color: 'grey'
		        	},
		        	showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>Y: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout: {
				autosize: true,
				showlegend: true,
				hovermode: 'closest',
				margin: {
					l: 50,
					r: 50,
					b: 50,
					t: 50,
					pad: 4
				},
				paper_bgcolor: '#cecece',
  		// 		plot_bgcolor: '#cccccc',
				yaxis: {
					title: "Income Y(t)",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: []
				},
				xaxis: {
					title: 'Time, t',
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
	    this.onValueChange = this.onValueChange.bind(this);
	}

	onValueChange(event) {
		this.setState({
			selectedOption: event.target.value
		}, function() {
			this.computeEquilibrium();
		});
	}

	componentDidMount() {
		this.computeEquilibrium(this.state.params);
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

		var time = [0,1];
		var income = [0,params.init_shock];
        
        for(let t = 2; t <= params.tfinal ; t++){
			time.push(t);
		    income.push(params.beta/(1-params.alpha)*(income[t-1]-income[t-2]))
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = income;

		const eq = 0
        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq,eq]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
		this.setState({
			data: partialState.data,
			layout: newLayout
		})
		// console.log(this.state)
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Schelling (1947)</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Global parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="t_{final}" />
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Economic parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\beta" />
								          <input name="beta" value={this.state.params.beta} step={steps.beta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Initial shock</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <input name="init_shock" value={this.state.params.init_shock} step={steps.init_shock} className="entry-form" type="number" onChange={this.handleChange} />
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
  document.getElementById('root-schelling_1947')
);