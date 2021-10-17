import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
import {InlineMath} from 'react-katex';
import {exp,pow,divide,max,round,multiply,add,subtract,cos,sin,pi,sqrt,abs,log,complex} from 'mathjs'

const Plot = createPlotlyComponent(Plotly);

const steps = {
	tfinal: 5,
	theta: 0.1,
	tshock: 1,
	U: 0.1,
	m: 0.01,
	n: 0.01,
	I0: 0.01,
	cpi: 0.01,
	s: 0.01,
	c: 0.01,
	K0: 0.1
}

const btn_choices = ["Trajectory","Stability","Profit rate","Income"]

function initPoint(z, k){
	const I = complex({re: 0, im: 1})
	const tPiKI = complex({re: 0, im: 2*pi*k})
	let tmp = add(log(z), tPiKI)
	let ip = subtract(tmp, log(tmp))
	const p = sqrt(2*(multiply(exp(1),z)+1))
	if(abs(add(z, exp(-1))) <= 1){
		if(k === 0){
			ip = add(subtract(add(-1, p), multiply(1/3, pow(p,2))), multiply(11/72, pow(p,3)))
		}
		if(k === 1 && z.im < 0){
			ip = subtract(subtract(subtract(-1, p), multiply(1/3, pow(p,2))), multiply(11/72, pow(p,3)))
		}
		if(k === -1 && z.im > 0){
			ip = subtract(subtract(subtract(-1, p), multiply(1/3, pow(p,2))), multiply(11/72, pow(p,3)))
		}
	}
  
	if(k === 0 && abs(subtract(z, 0.5)) <= 0.5){
		ip = divide(multiply(0.35173371, (add(0.1237166, multiply(7.061302897, z)))), add(2, multiply(0.827184, add(1, multiply(2,z)))))// (1,1) Padé approximant for W(0,a)
	}
	if (k === -1 && abs(subtract(z, 0.5)) <= 0.5){
		ip = -(divide(multiply(add(2.2591588985, multiply(4.22096,I)), subtract(multiply(subtract(-14.073271, multiply(33.767687754,I)), z), multiply(subtract(12.7127, multiply(19.071643,I)), add(1, multiply(2,z))))), subtract(2, multiply(subtract(17.23103, multiply(10.629721,I)), add(1, multiply(2,z))))))
	}// (1,1) Padé approximant for W(-1,a)
  
  return(ip)
}

function lambertW(z, k = 0){
  // Some values of z and k yield known results
  if(z === 0){
  	if(k === 0){
  		return(0)
  	} else{
  		return(-Infinity)
  	}
  }
  if(z === -exp(-1) && (k === 0 || k === -1)){
  	return(-1)
  }
  if(z === exp(1) && k === 0){
  	return(1)
  }

  z = complex({re: z, im: 0})
  
  // Halley's method
  var w = initPoint(z, k)
  // console.log(w)
  const maxiter = 30 // Apparently there is a small chance of infinite loops
  const prec = 10e-30 // Threshold of precision

  for(let i=0; i<=maxiter; i++){
    let wprev = w
    w = subtract(w,divide(subtract(multiply(w,exp(w)),z),subtract(multiply(exp(w),add(w,1)), divide(multiply(add(w,2),subtract(multiply(w,exp(w)),z)),add(multiply(2,w),2)))))
    if(abs(subtract(w,wprev)) < prec){
    	break
    }
  }
  return(w)
}


class App extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	    	params: {
				tfinal: 50,
				theta: 0.6,
				tshock: '',
				U: 5.6,
				m: 0.95,
				n: 0.121,
				I0: 1,
				cpi: 3,
				s: 0.2,
				c: 0.2,
				new_c: '',
				K0: 150
	    	},
	    	graph_sel: {
	    		value: "traj",
	    		traj_sel: "sel",
	    		stab_sel: "",
	    		prof_sel: "",
	    		inc_sel: "",
	    		collapseLog: "collapse"
	    	},
	    	data_traj: [
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "Investment",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>I: %{y:.1f}' +
                        '<extra></extra>'
		        }
		    ],
		    data_stab: [
				{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>I: %{y:.1f}' +
                        '<extra></extra>'
		        },
				{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.0f}' +
                        '<br>I: %{y:.1f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],// current point
		        	mode: 'markers',
		        	type: 'scatter',
		        	marker: {
						color: 'red',
						size: 10,
					},
		        	showlegend: false,
		            hoverinfo: '',
		            hovermode: false
		        }
		    ],
		    data_prof: [
				{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.1f}' +
                        '<br>P/K: %{y:.1f}' +
                        '<extra></extra>'
		        }
		    ],
		    data_inc: [
				{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "",
		            line: {
		            	color: "black"
		            },
		            showlegend: false,
		            hovertemplate: 
		            	't: %{x:.1f}' +
                        '<br>Y: %{y:.1f}' +
                        '<extra></extra>'
		        }
		    ],
		    layout_traj: {
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
					title: "Investment, I(t)",
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
			},
		    layout_stab: {
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
					title: "n",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: [-0.5,4]
				},
				xaxis: {
					title: 'm',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					range: [-0.5,3]
				}
			},
		    layout_prof: {
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
					title: "Profit rate",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: []
				},
				xaxis: {
					title: 'time',
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
					autorange: true
				}
			},
		    layout_inc: {
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
					title: "Income",
					titlefont: {
				      	family: 'Arial, sans-serif',
				      	size: 18,
				      	color: '#333'
				    },
				    range: []
				},
				xaxis: {
					title: 'time',
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
	    this.handleGraph = this.handleGraph.bind(this);
	    // this.handleShock = this.handleShock.bind(this);
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

	handleGraph(event) {
		if(event.target.name !== this.state.graph_sel){
			var graph_sel = {
				value: event.target.name
			}
			graph_sel[event.target.name+"_sel"] = "sel"
			graph_sel[btn_choices[(btn_choices.indexOf(event.target.name)+1)%2]+"_sel"] = ""
			this.setState({
				graph_sel
			}, function() {
				this.computeEquilibrium(this.state.params);
			})
		}
	}

	computeEquilibrium() {
		var params = this.state.params;
		var change = false
		// console.log(typeof params.new_c !== 'undefined')
		if(typeof params.new_c !== 'undefined' & params.tshock > 0 & params.new_c !== null){
			// console.log(params.tshock,params.new_c)
			change = true
		} else{
			change = false
		}

		if(this.state.graph_sel.value === 'traj' || this.state.graph_sel.value === 'prof' || this.state.graph_sel.value === 'inc'){
			let time = [];
			let inv = [];
			let prod = [];
			let inc = [];
			let profits = [];
			let capital = [];
			let pk = [];
			let c = params.c;
			let a = -(params.m+params.theta*params.n)/params.theta
			let b = params.m/params.theta

			let C = params.n - (exp(params.m-1)-params.m)/params.theta

			if(C > 0){//Cyclical case
	            let lambda = add(divide(lambertW(a*params.theta*exp(-b*params.theta),0),params.theta),b)

	            // console.log(lambda)
	            for(let t = 0; t <= params.tfinal; t+=0.1){
	            	if(change & t >= params.tshock){
	            		c = params.new_c;
	            	}
					time.push(t);
					inv.push(exp(lambda.re*t)*sin(lambda.im*t) + params.U);
					prod.push((lambda.im*exp(lambda.re*t)*(exp(-lambda.re*params.theta)*cos(lambda.im*params.theta)-cos(lambda.im*t)) + lambda.re*exp(lambda.re*t)*(sin(lambda.im*t)-exp(-lambda.re*params.theta)*sin(lambda.im*params.theta)))/(params.theta*(lambda.im^2+lambda.re^2)) + params.U)
					inc.push((1/c)*((params.cpi+prod[round(t/0.1)])/(1-params.s)))
					profits.push(c*inc[round(t/0.1)])
					capital.push(0.1*(-lambda.im*exp(lambda.re*params.theta)*cos(lambda.im*params.theta) + lambda.re*exp(lambda.re*params.theta)*sin(lambda.im*params.theta))/(lambda.im^2+lambda.re^2) + params.K0)
					pk.push(profits[round(t/0.1)] / capital[round(t/0.1)])
				}
			} else if(a*params.theta*exp(-b*params.theta) < 0){// Two real roots
				let lambda1 = add(divide(lambertW(a*params.theta*exp(-b*params.theta),0),params.theta),b)
				let lambda2 = add(divide(lambertW(a*params.theta*exp(-b*params.theta),-1),params.theta),b)

	            // console.log(lambda1,lambda2)
	            
	            for(let t = 0; t <= params.tfinal; t++){
					time.push(t);
					inv.push(exp(lambda1.re*t) + exp(lambda2.re*t) + params.U);
				}
			} else{// One real root
				let lambda = add(divide(lambertW(a*params.theta*exp(-b*params.theta),0),params.theta),b)

	            // console.log(lambda)
	            
	            for(let t = 0; t <= params.tfinal; t++){
					time.push(t);
					inv.push(exp(lambda.re*t) + params.U);
				}

			}
			// console.log(time)
			
			let partialState = Object.assign({}, this.state);
			partialState.data_traj[0].x = time;
			partialState.data_traj[0].y = inv;
			// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
			const newLayout = Object.assign({}, this.state.layout_traj);
			newLayout.datarevision = (partialState.layout_traj.datarevision + 1) % 10;
			this.setState({
				data_traj: partialState.data_traj,
				layout_traj: newLayout
			})

			partialState.data_prof[0].x = time;
			partialState.data_prof[0].y = pk;

			const newLayout_pr = Object.assign({}, this.state.layout_prof);
			newLayout_pr.datarevision = (partialState.layout_prof.datarevision + 1) % 10;
			newLayout_pr.yaxis.range = [0,1.1*max(pk)];
			this.setState({
				data_prof: partialState.data_prof,
				layout_prof: newLayout_pr
			})

			partialState.data_inc[0].x = time;
			partialState.data_inc[0].y = inc;

			const newLayout_inc = Object.assign({}, this.state.layout_inc);
			newLayout_inc.datarevision = (partialState.layout_inc.datarevision + 1) % 10;
			newLayout_inc.yaxis.range = [0,1.1*max(inc)];
			this.setState({
				data_inc: partialState.data_inc,
				layout_inc: newLayout_inc
			})

		} else if(this.state.graph_sel.value === 'stab'){
			let limit_cycle = [];
			let cycle_growth = [];
			let m = [];
			for(let i = -0.5; i <= 3; i += 0.01){
				m.push(i)
				if(i <= 1){
					limit_cycle.push(pi/(2*params.theta)*(1-i))
				} else{
					limit_cycle.push(0)
				}
				cycle_growth.push((exp(i-1)-i)/params.theta)
			}

			let partialState = Object.assign({}, this.state);
			partialState.data_stab[0].x = m;
			partialState.data_stab[0].y = limit_cycle;

			partialState.data_stab[1].x = m;
			partialState.data_stab[1].y = cycle_growth;

			partialState.data_stab[2].x = [params.m];
			partialState.data_stab[2].y = [params.n];

			// console.log(params.n,params.m)

			// See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
			const newLayout = Object.assign({}, this.state.layout_stab);
			newLayout.datarevision = (partialState.layout_traj.datarevision + 1) % 10;
			this.setState({
				data_stab: partialState.data_stab,
				layout_stab: newLayout
			})
			// console.log(this.state)	
			// console.log(this.state["data_"+this.state.graph_sel.value])		
		}
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Kalecki (1935)</h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="t_{final}" />
								          <input name="tfinal" value={this.state.params.tfinal} step={steps.tfinal} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="\theta" /> (Lag)
								          <input name="theta" value={this.state.params.theta} step={steps.theta} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="m" />
								          <input name="m" value={this.state.params.m} step={steps.m} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="n" />
								          <input name="n" value={this.state.params.n} step={steps.n} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="C_{\pi}" />
								          <input name="cpi" value={this.state.params.cpi} step={steps.cpi} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="c = \frac{P}{Y}" />
								          <input name="c" value={this.state.params.c} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="s_{\pi}" />
								          <input name="s" value={this.state.params.s} step={steps.s} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Equilibrium level</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="U" />
								          <input name="U" value={this.state.params.U} step={steps.U} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="K_0" />
								          <input name="K0" value={this.state.params.K0} step={steps.K0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
							<h4><u>Shock on c</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          New value for c:
								          <input name="new_c" value={this.state.params.new_c} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-6">
									<div className="entry">
								        <label>
								          Time of shock:
								          <input name="tshock" value={this.state.params.tshock} step={steps.tshock} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>

{/*							<h4><u>Initial Conditions</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								        <label>
								          <InlineMath math="I(0)" />
								          <input name="I0" value={this.state.params.I0} step={steps.I0} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
							</div>
*/}					    </div>
				    </div>
				    <div className="block-10">
				    	<div id="graph_selector" className="row">
							<div className="block-2">
								<button id="traj_btn" className={"btn " + this.state.graph_sel.traj_sel} name="traj" onClick={this.handleGraph}>Trajectory</button>
							</div>
							<div className="block-2">
								<button id="stab_btn" className={"btn " + this.state.graph_sel.stab_sel} name="stab" onClick={this.handleGraph}>Stability</button>
							</div>
							<div className="block-2">
								<button id="prof_btn" className={"btn " + this.state.graph_sel.stab_sel} name="prof" onClick={this.handleGraph}>Profit rate</button>
							</div>
							<div className="block-2">
								<button id="inc_btn" className={"btn " + this.state.graph_sel.inc_sel} name="inc" onClick={this.handleGraph}>Income</button>
							</div>
						</div>
						<div id="model">
							<Plot
								data={this.state["data_"+this.state.graph_sel.value]}
								layout={this.state["layout_"+this.state.graph_sel.value]}
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
  document.getElementById('root-kalecki_1935')
);