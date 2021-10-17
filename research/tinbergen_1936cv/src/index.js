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
	theta: 1,
	eta: 1,
	a: 0.1,
	b: 0.1,
	alpha: 1,
	beta: 1,
	P: 5,
	B: 5,
	K: 10,
	Q: 5,
	Q0: 0.5,
	Q1: 0.5
}

function prices_without_plan(a,b,alpha,beta,q,P,B,Q,t){
    // return(1/(B*(a+b)-alpha*b+b*(a+b)*q[t-2])*(a*beta*q[t-1]-(P+Q)*a*b*q[t-2]));
    return(1/(B*(a+b)-alpha*b)*(a*beta*q[t-1]-(P+Q)*a*b*q[t-2]));
}

function prices_with_plan(a,b,alpha,beta,q,P,B,Q,t){
    // return(1/(B+b*P+b*q[t-2])*(beta*q[t-1]-(P+Q)*b*q[t-2]));
    return(1/(B+b*P)*(beta*q[t-1]-(P+Q)*b*q[t-2]));
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 30,
				theta: 0,
				eta: 2,
				a: 4,
				b: 4/3,
				alpha: 190,
				beta: 190,
				B: 100,
				K: 10000,
				P: 25,
				Q: 75,
				Q0: 0,
				Q1: 1
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "Prices - without plan",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>q: %{y:.1f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "Prices - with plan",
		            line: {
		            	color: "red"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>q: %{y:.1f}' +
                        '<extra></extra>'
		        },
		        // {
		        // 	x: [],
		        // 	y: [],
		        // 	mode: 'lines+markers',
		        // 	line: {
		        // 		dash: 'dot',
		        // 		color: 'grey'
		        // 	},
		        // 	showlegend: false,
		        //     hovertemplate: 
		        //     	't: %{x:.0f}' +
          //               '<br>p: %{y:.1f}' +
          //               '<extra></extra>'
		        // },
		        // {
		        // 	x: [],
		        // 	y: [],
		        // 	mode: 'lines+markers',
		        // 	line: {
		        // 		dash: 'dot',
		        // 		color: 'grey'
		        // 	},
		        // 	showlegend: false,
		        //     hovertemplate: 
		        //     	't: %{x:.0f}' +
          //               '<br>p: %{y:.1f}' +
          //               '<extra></extra>'
		        // }
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
					title: "Prices, Q + q(t)",
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
		var prices_without = [params.Q0,params.Q1];
		var prices_with = [params.Q0,params.Q1];
        
        let p = 0;
        for(var t = 2; t <= params.tfinal ; t++){
			time.push(t);
            p = prices_without_plan(params.a,params.b,params.alpha,params.beta,prices_without,params.P,params.B,params.Q,t)
            // if(p < 0) p = 0;
            prices_without.push(p)
        }
        if(prices_without.length < params.tfinal){
        	for(t ; t <= params.tfinal+1 ; t++){
        		time.push(t);
        		prices_without.push(0);
        	}
        }

        for(t = 2; t <= params.tfinal ; t++){
            p = prices_with_plan(params.a,params.b,params.alpha,params.beta,prices_with,params.P,params.B,params.Q,t)
            // if(p < 0) p = 0;
            prices_with.push(p)
        }
        if(prices_with.length < params.tfinal){
        	for(t ; t <= params.tfinal+1 ; t++){
        		prices_with.push(0);
        	}
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = prices_without;

		partialState.data[1].x = time;
		partialState.data[1].y = prices_with;

		// const eq1 = params.P
  //       const eq2 = (params.k*params.theta-params.A)/params.a
        // partialState.data[2].x = [0,params.tfinal]
        // partialState.data[2].y = [eq1,eq1]
        // partialState.data[1].x = [0,params.tfinal]
        // partialState.data[1].y = [eq2,eq2]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
        newLayout.yaxis.range = [1.1*Math.min(...prices_without),1.1*Math.max(...prices_without)]
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
				<h1>Tinbergen (1936) - Commodity variant</h1>
				<div className="row">
				    <div className="block-3">
				    	<div id="settings">
				    		<h4><u>Global parameters</u></h4>
							<div className="row">
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
								          <InlineMath math="\theta" /> (Lag)
								          <input name="theta" value={this.state.params.theta} step={steps.theta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\eta" /> (Lag)
								          <input name="eta" value={this.state.params.eta} step={steps.eta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
				    		<h4><u>Sensibility parameters</u></h4>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="a" />
								          <input name="a" value={this.state.params.a} step={steps.a} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="b" />
								          <input name="b" value={this.state.params.b} step={steps.b} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\beta" />
								          <input name="beta" value={this.state.params.beta} step={steps.beta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Equilibrium levels</u></h4>
							<div className="row">
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="B" />
								          <input name="B" value={this.state.params.B} step={steps.B} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="K" />
								          <input name="K" value={this.state.params.K} step={steps.K} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="P" />
								          <input name="P" value={this.state.params.P} step={steps.P} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-3">
									<div className="entry">
								        <label>
								          <InlineMath math="Q" />
								          <input name="Q" value={this.state.params.Q} step={steps.Q} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="q(0)" />
								          <input name="Q0" value={this.state.params.Q0} step={steps.Q0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="q(1)" />
								          <input name="Q1" value={this.state.params.Q1} step={steps.Q1} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
					    </div>
				    </div>
				    <div className="block-9">
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
  document.getElementById('root-tinbergen_1936cv')
);