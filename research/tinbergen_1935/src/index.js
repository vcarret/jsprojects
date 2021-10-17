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
	a: 0.1,
	k: 0.01,
	P: 0.05,
	A: 0.05,
	K: 0.05,
	P0: 0.01,
	P1: 0.01,
	tshock: 1,
	alpha: 0.01
}

function demand(K,k,p,P,t,tshock,alpha,cur_case){
	if(t <= tshock){
    	return(K + 2*k*p);
	} else if(t === tshock + 1){
		if(cur_case === "case1"){
			return(K*(1+alpha) + 2*k*(1+alpha)*p);
		} else if(cur_case === "case2"){
			return(K*(1+alpha) + 2*k*(1+alpha)*(p-alpha*P))
		}
	} else if(t >= tshock + 2){
		return(K*(1+alpha) + 2*k*(1+alpha)*(p-alpha*P))
	}
}

function supply(A,a,p,P,t,tshock,alpha,cur_case){
	if(t <= tshock + 1){
	    return(A + a*p);
	} else if(t === tshock + 2){
		if(cur_case === "case1"){
			return(A + a*p);
		} else if(cur_case === "case2"){
			return(A-a*alpha*P+a*p)
		}
	} else if(t >= tshock + 3){
		return(A-a*alpha*P+a*p)
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
			    tfinal: 70,
				theta: 2,
				a: 1,
				k: 3/4,
				P: 1,
				A: 1,
				K: 1,
				P0: 0,
				P1: 0.07,
				tshock: 10,
				alpha: 0.1
	    	},
	    	sel_case: {
	    		cur_sel: "case2"
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: 'Supply',
		            line: {
		            	color: "red"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>A: %{y:.2f}' +
                        '<extra></extra>'
		        },
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: 'No Shock Supply',
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>A: %{y:.2f}' +
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
					title: "Supply, A + a p(t-2)",
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
	    this.handleClick = this.handleClick.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	}

	handleClick(event) {
		let partialState = Object.assign({}, this.state);
		if(event.target.value !== this.state.sel_case.cur_sel){
			partialState.sel_case.cur_sel = event.target.value;
			this.setState(partialState, function() {
				this.computeEquilibrium();
			});
		}
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

		var prices_ns = [params.P+params.P0,params.P+params.P1];
		var dem_ns = [params.K,params.K];
		var sup_ns = [params.A,params.A];
        let p_ns = 0;
        for(var t = 2; t <= params.tfinal ; t++){
            dem_ns.push(demand(params.K,params.k,prices_ns[t-1]-params.P,params.P,t,params.tfinal,params.alpha,this.state.sel_case.cur_sel));
            sup_ns.push(supply(params.A,params.a,prices_ns[t-2]-params.P,params.P,t,params.tfinal,params.alpha,this.state.sel_case.cur_sel));
            // console.log(dem_ns,sup_ns)
            p_ns = dem_ns[t]/sup_ns[t];
            if(p_ns < 0) break;
            prices_ns.push(p_ns)
        }
        if(prices_ns.length < params.tfinal){
        	for(t ; t <= params.tfinal+1 ; t++){
        		sup_ns.push(0);
        		dem_ns.push(0);
        		prices_ns.push(0);
        	}
        }

		var prices = [params.P+params.P0,params.P+params.P1];
		var dem = [params.K,params.K];
		var sup = [params.A,params.A];
        let p = 0;
        for( t = 2; t <= params.tfinal ; t++){
			time.push(t);
            dem.push(demand(params.K,params.k,prices[t-1]-params.P,params.P,t,params.tshock,params.alpha,this.state.sel_case.cur_sel))
            sup.push(supply(params.A,params.a,prices[t-2]-params.P,params.P,t,params.tshock,params.alpha,this.state.sel_case.cur_sel))
            p = dem[t]/sup[t]
            if(p < 0) break;
            prices.push(p)
        }
        if(prices.length < params.tfinal){
        	for(t += 1 ; t <= params.tfinal+1 ; t++){
        		time.push(t);
        		sup.push(0);
        		dem.push(0);
        		prices.push(0);
        	}
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = time;
		partialState.data[0].y = sup;
		partialState.data[1].x = time;
		partialState.data[1].y = sup_ns;
		// partialState.data[2].x = time;
		// partialState.data[2].y = prices;

		// const eq1 = params.P
  //       const eq2 = (params.k*params.theta-params.A)/params.a
  //       partialState.data[3].x = [0,params.tfinal]
  //       partialState.data[3].y = [eq1,eq1]
  //       partialState.data[4].x = [0,params.tfinal]
  //       partialState.data[4].y = [eq2,eq2]

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
        newLayout.yaxis.range = [0,1.1*Math.max(...prices)]
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
				<h1>Tinbergen (1935)</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Global Parameters</u></h4>
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
				    		<h4><u>Sensitivity Parameters</u></h4>
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
								          <InlineMath math="k" />
								          <input name="k" value={this.state.params.k} step={steps.k} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Equilibrium Levels</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="A" />
								          <input name="A" value={this.state.params.A} step={steps.A} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="K" />
								          <input name="K" value={this.state.params.K} step={steps.K} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="P" />
								          <input name="P" value={this.state.params.P} step={steps.P} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="p(0)" />
								          <input name="P0" value={this.state.params.P0} step={steps.P0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="p(1)" />
								          <input name="P1" value={this.state.params.P1} step={steps.P1} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Wage Shock</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="t_{shock}" />
								          <input name="tshock" value={this.state.params.tshock} step={steps.tshock} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\alpha" />
								          <input name="alpha" value={this.state.params.alpha} step={steps.alpha} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							Transition:
							<div className="radio-row">
								<div className="block-6">
									<div className="entry">
										<input type="radio" id="case1" name="case" value="case1" onClick={this.handleClick}/>
										<label>Case 1</label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
										<input type="radio" id="case2" name="case" value="case2" defaultChecked="checked" onClick={this.handleClick}/>
										<label>Case 2</label>
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
  document.getElementById('root-tinbergen_1935')
);