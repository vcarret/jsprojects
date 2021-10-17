import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';
import {exp,evaluate,pow,divide,multiply,add,subtract,cos,pi,sqrt,abs,log,round,complex} from 'mathjs'

const Plot = createPlotlyComponent(Plotly);

const steps = {
	"eps": 1,
	"tfinal": 5,
	"m": 0.1,
	"lam": 0.01,
	"r": 0.1,
	"s": 0.1,
	"mu": 0.5,
	"shock": 0.1,
	"h": 1,
	"c": 0.01,
	"ncomps": 1
}

function iFT(t,h){
	return(round(t/h))
}

function yt(m,mu,x,t,h){
  	return(m*x[iFT(t,h)]+mu*(x[iFT(t+h,h)]-x[iFT(t,h)])/h)
}

function coefs(s,a,b,c,d,eps,disc,ic){
	let num = 0;
	let denom = 0;
	let scope = {
		s:s,
		a:a,
		b:b,
		c:c,
		d:d,
		eps:eps,
		disc:disc,
		ic:ic
	}
	if(s !== 0){
		num = evaluate('c+s*disc+(d/s-b)*ic*(1-exp(-eps*s))-d*ic*eps',scope)
	} else{
		num = c
	}
	denom = evaluate('2*s+a+b*exp(-eps*s)-b*s*eps*exp(-eps*s)+d*eps*exp(-eps*s)',scope)
	return(divide(num,denom))
}

function polyFrisch(x,a,b,d,eps=6,deriv=0){
	let scope = {
		x:x,
		a:a,
		b:b,
		d:d,
		eps:eps
	}
	if(deriv === 0){
		return(evaluate('x^2+a*x+b*x*exp(-eps*x)+d-d*exp(-eps*x)',scope))
	} else if(deriv === 1){
		return(evaluate('2*x+a+b*exp(-eps*x)-eps*b*x*exp(-eps*x)+eps*d*exp(-eps*x)',scope))
	}
}

function newton(x,a,b,d,eps=6){
	return(subtract(x,divide(polyFrisch(x,a,b,d,eps),polyFrisch(x,a,b,d,eps,1))))
}

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
				"eps": 6,
				"tfinal": 50,
				"m": 0.5,
				"lam": 0.05,
				"r": 2,
				"s": 1,
				"mu": 10,
				"shock": 1.452,
				"h": 1/6,
				"c": 0.165,
				"ncomps": 4
	    	},
	    	data: [
	    		{
	    			x: [],
		            y: [],
		            type: 'scatter',
		            mode: 'lines',
		            name: "Consumption, x",
		            line: {
		            	color: "black"
		            },
		            hovertemplate: 
		            	't: %{x:.2f}' +
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
		            	't: %{x:.2f}' +
                        '<br>x: %{y:.2f}' +
                        '<extra></extra>'
		        },
		        {
		        	x: [],
		        	y: [],
		            type: 'scatter',
		        	mode: 'lines',
		        	name: 'Components sum',
		            hovertemplate: 
		            	't: %{x:.2f}' +
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
			},
			eq: 1.32,
			showCompSum: false
	    };

	    this.handleChange = this.handleChange.bind(this);
	    this.handleComps = this.handleComps.bind(this);
	    this.handleCompSum = this.handleCompSum.bind(this);
	    this.computeEquilibrium = this.computeEquilibrium.bind(this);
	    this.addComp = this.addComp.bind(this);
	    this.showCompSum = this.showCompSum.bind(this)
	}

	handleCompSum(event){
		let partialState = Object.assign({}, this.state);
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;

		if(this.state.showCompSum){
			partialState.data[2].x = [];
			partialState.data[2].y = [];
		} else{
			this.showCompSum(partialState);
		}

		this.setState({
			data: partialState.data,
			showCompSum: !this.state.showCompSum,
			layout: newLayout
		})
	}

	showCompSum(partialState) {
		let params = this.state.params;

		if(params.ncomps > 0){
			const eq = params.c/(params.lam*(params.r+params.s*params.m));
			var times = [];
			var compSum = [];
			for(let t = 0; t<params.tfinal; t += params.h){
				times.push(t);
				let sum = 0;
				for(let i = 3; i <= partialState.data.length-1; i++){
					sum += partialState.data[i].y[iFT(t,params.h)]-eq;
				}
				compSum.push(sum+eq);
			}			
		}

		partialState.data[2].x = times;
		partialState.data[2].y = compSum;
	}

	componentDidMount() {
		let partialState = Object.assign({}, this.state);

		for(let i = 1; i <= this.state.params.ncomps; i++){
			this.addComp(partialState,i)
		}

        const newLayout = Object.assign({}, this.state.layout);
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;

		this.setState({
			data: partialState.data,
			layout: newLayout
		})

		this.computeEquilibrium(this.state.params);
	}

	addComp(partialState, ncomp) {
		let params = this.state.params;
		let a = params.lam*params.r+params.lam*params.s*params.mu/params.eps;
		let b = -params.lam*params.s*params.mu/params.eps;
		let d = params.lam*params.s*params.m/params.eps;

		let rho = subtract(divide(lambertW(-b*exp(a*params.eps)*params.eps, ncomp-1),params.eps),a);

		for(let i=1; i<=100; i++){
	      	let xp = newton(rho,a,b,d,params.eps);
	      	if(abs(subtract(rho, xp)) < 1e-10) break
	      	else rho = xp;
	    }
	    if(round(rho,5) === 0){
	      rho = -1
	      for(let i=1; i<=100; i++){
	        let xp = newton(rho,a,b,d,params.eps)
	        if(abs(subtract(rho, xp)) < 1e-10) break
	        else rho = xp
	      }
	    }

		const eq = params.c/(params.lam*(params.r+params.s*params.m));
		let disc = params.shock;
		let init_vals = eq;
		let ks = coefs(rho,a,b,params.c,d,params.eps,disc,init_vals);

		let pks = multiply(2,ks).toPolar();

		var times = [];
		var comp = [];
		for(let i = 0; i<params.eps; i+=params.h){
			comp.push(eq)
		}
		var name = ""
		if(rho.im < 1e-6){
			name = "Trend"
			for(let t = 0; t<(params.tfinal-params.eps); t += params.h){
				times.push(round(t,4));
				comp.push(init_vals+ks.re*exp(t*rho.re));
			}
		} else{
			name = "Cycle " + (ncomp - 1)
			for(let t = 0; t<(params.tfinal-params.eps); t += params.h){
				times.push(round(t,4));
				comp.push(init_vals+pks.r*exp(t*rho.re)*cos(t*rho.im + pks.phi));
			}
		}
		for(let t = (params.tfinal-params.eps); t<params.tfinal; t+=params.h){
			times.push(t)
		}

		var new_comp = {
	    			x: times,
		            y: comp,
		            type: 'scatter',
		            mode: 'lines',
		            name: name,
		            hovertemplate: 
		            	't: %{x:.2f}' +
                        '<br>x: %{y:.2f}' +
                        '<extra></extra>'
		        }

		partialState.data.push(new_comp);

		if(this.state.showCompSum){
			this.showCompSum(partialState);
		}
	}

	handleChange(event) {
		let partialState = Object.assign({}, this.state);
		partialState.params[event.target.name] = parseFloat(event.target.value);
		if(event.target.name === 'eps') partialState.params.h = 1/event.target.value
		this.setState(partialState, function() {
			this.computeEquilibrium();
		});
	}

	handleComps(event) {
		let partialState = Object.assign({}, this.state);
		let ncomps = event.target.value;

		if(ncomps < this.state.params.ncomps){
			partialState.data.pop();
			if(this.state.showCompSum){
				this.showCompSum(partialState);
			}
		} else if(ncomps > this.state.params.ncomps){
			this.addComp(partialState,ncomps);
		}

		partialState.params.ncomps = ncomps;

        const newLayout = Object.assign({}, this.state.layout);
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;

		this.setState({
			params: partialState.params,
			data: partialState.data,
			layout: newLayout
		})
	}

	computeEquilibrium() {
		var params = this.state.params;

		const eq = params.c/(params.lam*(params.r+params.s*params.m));

		var times = [];
		var conso = [];
		for(let t = 0; t<params.eps; t += params.h){
			times.push(round(t,4));
			conso.push(eq);
		}
		conso.push(params.shock)

		let denom = 1+params.lam*params.s*params.h*params.mu/(2*params.eps);
		let sumy = 0;
        for(var t = params.eps; t < params.tfinal; t += params.h){
			times.push(round(t,4));
			sumy = 0;
			for(var i = params.h; i < (params.eps); i+=params.h){
				sumy += yt(params.m,params.mu,conso,t-i,params.h);
			}
			conso.push((params.h*params.c+(1-params.lam*params.h*params.r-(params.h*params.lam*params.s*(params.h*params.m-params.mu))/(2*params.eps))*conso[iFT(t,params.h)]-params.lam*params.s*params.h**2/params.eps*(yt(params.m,params.mu,conso,t-params.eps,params.h)/2+sumy))/denom)
        }

		let partialState = Object.assign({}, this.state);
		partialState.data[0].x = times;
		partialState.data[0].y = conso;

        partialState.data[1].x = [0,params.tfinal]
        partialState.data[1].y = [eq,eq]

        if(params.ncomps > 0){
        	for(let i = 1; i <= params.ncomps; i++){
        		partialState.data.pop();
        	}
			for(let i = 1; i <= params.ncomps; i++){
				this.addComp(partialState,i);
			}
        }

        if(this.state.showCompSum){
			this.showCompSum(partialState);
		}

        // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
        const newLayout = Object.assign({}, this.state.layout);
        newLayout.xaxis.range = [0,this.state.params.tfinal]
        newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
		this.setState({
			data: partialState.data,
			layout: newLayout,
			eq: eq,
		})
		// console.log(this.state)
	}

	render() {
		return (
      		<div id = "page-wrapper">
				<h1>Ragnar Frisch's rocking horse model</h1>
				<div className="row">
				    <div className="block-3">
				    	<div id="settings">
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="\epsilon" /> (lag)
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
								<div className="block-4 collapse">
									<div className="entry">
								        <label>
								         <InlineMath math="h" /> (step)
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
							<div className="row">
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="c" />
								          <input name="c" value={this.state.params.c} step={steps.c} className="entry-form" type="number" onChange={this.handleChange} />
								        </label>
								    </div>
								</div>
								<div className="block-4">
									<div className="entry">
								        <label>
								          <InlineMath math="n_{components}" />
								          <input name="ncomps" value={this.state.params.ncomps} step={steps.ncomps} className="entry-form" type="number" onChange={this.handleComps} />
								        </label>
								    </div>
								</div>
							</div>
							<div id="last" className="row">
								<div className="block-11">
									<div className="entry">
								        <label>
								          Show the sum of components:
								          <input name="showCompSum" type="checkbox" checked={this.state.showCompSum} onChange={this.handleCompSum}/>
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

ReactDOM.render(
  <App />,
  document.getElementById('root-frisch-1933')
);