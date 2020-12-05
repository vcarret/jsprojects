import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';

const Plot = createPlotlyComponent(Plotly);

const steps = {
	"eps": 0.5,
	"tfinal": 5,
	"m": 0.1,
	"lam": 0.01,
	"r": 0.1,
	"s": 0.1,
	"mu": 0.5,
	"shock": 0.1,
	"h": 1,
	"c": 0.05
}

function iFT(t,h){
	return(Math.round(t/h))
}

function yt(m,mu,x,t,h){
  return(m*x[iFT(t,h)]+mu*(x[iFT(t+h,h)]-x[iFT(t,h)])/h)
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				"eps": 6,
				"tfinal": 50,
				"m": 0.5,
				"lam": 0.05,
				"r": 2,
				"s": 1,
				"mu": 10,
				"shock": 1.452,
				"h": 1/6,
				"c": 0.165
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],// IS 1
		            type: 'scatter',
		            mode: 'lines',
		            name: "Consumption, x",
		            line: {
		            	color: "black"
		            },
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
                        '<br>x: %{y:.2f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout: {
				autosize: true,
				showlegend: true,
				legend: {
					x: 0.8,
					y: 0.95, 
					font: {
						size:18
					},
					bgcolor: '#fff',
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
  		// 		plot_bgcolor: '#cccccc',
				yaxis: {
					title: "Consumption, x(t)",
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
					autorange: true
				}
			}
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
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

		const eq = params.c/(params.lam*(params.r+params.s*params.m));

		var times = [];
		var conso = [];
		for(let t = 0; t<params.eps; t += params.h){
			times.push(Math.round(t*1000)/1000);
			conso.push(eq);
		}
		conso.push(params.shock)

		let denom = 1+params.lam*params.s*params.h*params.mu/(2*params.eps);
		let sumy = 0;
        for(var t = params.eps; t < params.tfinal; t += params.h){
			times.push(Math.round(t*1000)/1000);
			sumy = 0;
			for(var i = params.h; i <= (params.eps); i+=params.h){
				sumy += yt(params.m,params.mu,conso,t-i,params.h);
			}
			conso.push((params.h*params.c+(1-params.lam*params.h*params.r-(params.h*params.lam*params.s*(params.h*params.m-params.mu))/(2*params.eps))*conso[iFT(t,params.h)]-params.lam*params.s*params.h**2/params.eps*(yt(params.m,params.mu,conso,t-params.eps,params.h)/2+sumy))/denom)
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = times;
		partialState.data[0].y = conso;

        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq,eq]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
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
				<h1>Frisch's rocking horse model</h1>
				<div className="row">
				    <div className="block-3">
				    	<div id="settings">
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\epsilon" />
								          <input name="eps" value={this.state.params.eps} step={steps.eps} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								         <InlineMath math="t_{final}" />
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								         <InlineMath math="h" />
								          <input name="h" value={this.state.params.h} step={steps.h} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="m" />
								          <input name="m" value={this.state.params.m} step={steps.m} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\lambda" />
								          <input name="lam" value={this.state.params.lam} step={steps.lam} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="r" />
								          <input name="r" value={this.state.params.r} step={steps.r} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="s" />
								          <input name="s" value={this.state.params.s} step={steps.s} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\mu" />
								          <input name="mu" value={this.state.params.mu} step={steps.mu} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="Shock" />
								          <input name="shock" value={this.state.params.shock} step={steps.shock} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-9">
				    	<div  id="model">
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

// class Diag extends React.Component {
// 	constructor(props) {
// 		super(props)
// 		this.trace1 = {
//             x: props.data.y,
//             y: props.data.is,
//             type: 'scatter',
//             mode: 'lines+markers',
//             marker: {color: 'red'},
//           }
//         this.trace2 = {
//             x: props.data.y,
//             y: props.data.lm,
//             type: 'scatter',
//             mode: 'lines+markers',
//             marker: {color: 'blue'},
//           }
// 		this.state = {
// 			data: [this.trace1,this.trace2], 
// 			layout: {
// 				autosize: true
// 			}
// 		}
// 		console.log(props)
// 	}

//   render() {
//     return (
//       <Plot
//         data={this.state.data}
//         layout={this.state.layout}
//         style={{width: "100%", height: "100%"}}
//         useResizeHandler={true}
//       />
//     );
//   }
// }

ReactDOM.render(
  <App />,
  document.getElementById('root-islm')
);