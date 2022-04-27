import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 5,
	a: 0.01,
	b: 0.01,
	c: 0.01,
	d: 0.01,
	shock: 0.1
}

function iFT(t,h=1/6){
	return(Math.round(t/h+1)-1)
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 80,
				a: 0.1833333,
				b: -0.083333,
				c: 0.004166667,
				d: 0.165,
				shock: 1.1,
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],// Income
		            type: 'scatter',
		            mode: 'lines',
		            name: "Trajectory",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>x: %{y:.2f}' +
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
					title: "x(t)",
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

		var eq = params.d/(params.a+params.b+params.c*6)
		var h = 1/6
		var eps = 6

		var times = []
		var x = []
		for(let t = 0; t<=params.tfinal; t+=h){
			let rt = Math.round(t*100)/100
			times.push(rt)
			if(t < 6){
				x.push(eq)
			} else if(rt === 6){
				x.push(params.shock*eq)
				x.push(params.d*h+(1-params.a*h)*x[iFT(t)]-params.b*h*x[iFT(t-eps)]-params.c*h*eps/6*(x[iFT(t)]+x[iFT(t-eps)]+4*x[iFT(t-eps/2)]))
			} else{
				x.push(params.d*h+(1-params.a*h)*x[iFT(t)]-params.b*h*x[iFT(t-eps)]-params.c*h*eps/6*(x[iFT(t)]+x[iFT(t-eps)]+4*x[iFT(t-eps/2)]))
			}
		}

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = times;
		partialState.data[0].y = x;

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
				<h1>Delay Differential Equation</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Time parameters</u></h4>
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
				    		<h4><u>Other parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="a" />
								          <input name="a" value={this.state.params.a} step={steps.a} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="b" />
								          <input name="b" value={this.state.params.b} step={steps.b} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="c" />
								          <input name="c" value={this.state.params.c} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="d" />
								          <input name="d" value={this.state.params.d} step={steps.d} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Initial shock (at t=6)</u></h4>
							<div className="row">						
								<div className="block-5">
									<div className="entry">
								        <label>
								          <input name="shock" value={this.state.params.shock} step={steps.shock} className="entry-form" type="number" onChange={this.handleChange} />* eq value
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
					    <div id="equations">
				    		<h4><u>Equation:</u></h4>
							<div className="row">
								<div className="block-12">
								    <InlineMath math="\dot x(t) + a x(t) + b x(t-\epsilon) + c \int^t_{t-\epsilon} x(\tau) d\tau = d" />
								</div>
								<div className="block-12">
								    <InlineMath math="\epsilon = 6, " />
								    <InlineMath math="h (time step) = 1/6" />
								</div>
							</div>
						</div>
				    </div>
				</div>
      		</div>
		)
	}
}

ReactDOM.render(
  <App />,
  document.getElementById('root-dde')
);