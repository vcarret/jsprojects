// The original code was found here: https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js
// Some other resources: 
// Refs migth be useful https://reactjs.org/docs/refs-and-the-dom.html#creating-refs
// And Vis.js docs: https://visjs.github.io/vis-network/examples/
// From the doc: The network visualization works smooth on any modern browser for up to a few thousand nodes and edges.
// Remember that it's all drawn on an HTML Canvas
// https://stackoverflow.com/questions/7034/graph-visualization-library-in-javascript
import { DataSet, Network } from 'vis';
import React, { Component, createRef } from "react";
import ReactDOM from 'react-dom';
import './index.css';

// Function to read data from matrix into nodes and edges
// Take igraph as example; several possible inputs
// display edges size according to matrix weights
// display node size according to output as per IO 
// Settings should be import and then some possible tweaking stuff; below settings should appear some basic measures and additional optional ones

const nodes = new DataSet([
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' },
  { id: 5, label: 'Node 5' }
]);

// create an array with edges
const edges = new DataSet([
  { from: 1, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 }
]);

const data = {
  nodes: nodes,
  edges: edges
};
const options = {};

// initialize your network!


class VisNetwork extends Component {

  constructor() {
    super();
    this.network = {};
    this.appRef = createRef();
  }

  componentDidMount() {
    this.network = new Network(this.appRef.current, data, options);
  }

  render() {
    return (
    	    <div id = "page-wrapper">
				<h1></h1>
				<div className="row">
				    <div className="block-2">
				    	<div id="settings">
				    		<h4><u>Parameters</u></h4>
							<div className="row">
								<div className="block-6">
									<div className="entry">
								    </div>
								</div>
							</div>
						</div>
					</div>	
				    <div className="block-10">
				    	<div id="model" ref={this.appRef} >
					    </div>
				    </div>
				</div>
      		</div>
    );
  }
}

ReactDOM.render(
  <VisNetwork />,
  document.getElementById('root-network')
);