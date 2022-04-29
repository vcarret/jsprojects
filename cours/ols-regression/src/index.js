// Resources:
// Nice table and example for parsing data: https://codesandbox.io/s/how-to-parse-or-read-csv-files-in-reactjs-ssr5s2?from-embed=&file=/src/App.js
// How to use Papa.parse See https://medium.com/how-to-react/how-to-parse-or-read-csv-files-in-reactjs-81e8ee4870b0
// For the callback: https://stackoverflow.com/questions/26266459/retrieve-parsed-data-from-csv-in-javascript-object-using-papa-parse
import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import Plotly from 'plotly.js-basic-dist';// see https://github.com/plotly/plotly.js/tree/master/dist#partial-bundles
import createPlotlyComponent from "react-plotly.js/factory";
// import 'katex/dist/katex.min.css';
import {InlineMath} from 'react-katex';
// import * as ss from 'simple-statistics'
import {inv,add,sqrt,mean,diag,subset,matrix,index,range,multiply,ones,transpose} from 'mathjs';

const Papa = require("papaparse/papaparse.min.js");

const Plot = createPlotlyComponent(Plotly);

const steps = {}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.filesInput = React.createRef();
    this.state = {
        params: {},
        stats: {
          n: 0,
          Rsquare: 0
        },
        table_content: undefined,
        variables: "collapse",
        reg_results: "collapse",
        database: undefined,
        data: [
          {
            x: [],
            y: [],// u
            type: 'scatter',
            mode: 'lines+markers',
            name: "regression",
            line: {
              color: "black"
            },
            hovertemplate: 
              'y: %{x:.0f}' +
              '<br>u: %{y:.2f}' +
              '<extra></extra>'
          },
          {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: 'GDP ~ Cap',
            marker: { 
              size: 12
            },
            hovertemplate: 
              'y: %{x:.0f}' +
              '<br>w: %{y:.2f}' +
              '<extra></extra>'
          }
        ],
        layout: {
          autosize: true,
          showlegend: true,
          legend: {
            x: 1,
            xanchor: 'right',
            y: 0
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
          xaxis: {
            title: '',
            titlefont: {
                  family: 'Arial, sans-serif',
                  size: 18,
                  color: '#333'
              },
          range: []
          },
          yaxis: {
            title: "",
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
      this.updateData = this.updateData.bind(this);
      this.chooseVars = this.chooseVars.bind(this);
      this.computeRegression = this.computeRegression.bind(this);
  }

  componentDidMount() {
    this.importCSV("e",this.updateData);
  }

  handleChange(event) {
    let partialState = Object.assign({}, this.state);
    partialState.params[event.target.name] = parseFloat(event.target.value);
    this.setState(partialState, function() {
      this.computeRegression();
    });
  }

  importCSV(event, callback){
    var csvFilePath = require("./data.csv");
    Papa.parse(csvFilePath, {//event.target.files[0] use this and delete previous line
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: function(results) {    
        callback(results)
      }
    });
  };

  updateData(results){
    var keys = [];
    var data = [];

    // Iterating data to get column name and their values
    results.data.map((d) => {
      keys.push(Object.keys(d));
      data.push(Object.values(d));
    });

    keys = keys[0]
    var y_var = keys[0]
    var x_var = keys.slice(1,keys.length)
    x_var.unshift("(Intercept)")

    this.setState({
      database: data,
      y_var: y_var,
      x_var: x_var,
      variables: ""
    }, function() {
      // The next step should be to display the different column names and give the possibility of choosing the role of each column (indepent / dependent variable)
      // Eventually give more options, like the kind of fit you want, the form of the model, etc.
      // Also display a new button to compute the regression after the choice has been made
      this.chooseVars();
    }); 
  }

  chooseVars() {
    // Choose:
    // 1: independent variable
    // 2: dependent variable to plot

    // Add names of variables to plot to the graph axes and to name of datapoints
    // const newLayout = Object.assign({}, this.state.layout);
    // newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
    // this.setState({
    //   layout: newLayout
    // })
  }

  computeRegression() {
    var n = this.state.database.length
    var p = this.state.x_var.length
    var Y = subset(this.state.database, index(range(0,n),0)).flat()
    var cof = subset(this.state.database, index(range(0,n),1)).flat()
    var tX = [Array(n).fill(1),cof]

    var X = transpose(tX)

    var Sxx = inv(multiply(tX,X))
    var beta = multiply(multiply(Sxx,tX),Y)

    var Yhat = multiply(X,beta)
    var Ybar = mean(Y)

    var ssr = Y.reduce((pV,cV) => pV + (cV - Yhat)^2)
    var sst = Y.reduce((pV,cV) => pV + (cV - Ybar)^2)
    var Rsquare = Math.round(1 - ssr/sst,3)


    var Vbeta_hat = multiply(ssr/(n-p), diag(Sxx))
    var std_err = sqrt(Vbeta_hat)
    // console.log(std_err)

    let partialState = Object.assign({}, this.state);
    partialState.data[0].x = subset(tX, index(1,range(0,n)))[0];
    partialState.data[0].y = Yhat;

    partialState.data[1].x = cof;
    partialState.data[1].y = Y;

    var table_content = this.state.x_var.map((k,i) => {
      return (
        <tr key={i}>
          <td>
            {k}
          </td>
          <td>
            {beta[i]}
          </td>
          <td>
            {std_err[i]}
          </td>
        </tr>
      );
    })

    var stats = {
      Rsquare: Rsquare,
      n: n,
      beta: beta,
      std_err: std_err
    }

    // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
    const newLayout = Object.assign({}, this.state.layout);
    newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
    this.setState({
      reg_results: "",
      table_content: table_content,
      data: partialState.data,
      stats: stats,
      layout: newLayout
    })


    // console.log(beta)

  }

  render() {
    return (
      <div id = "page-wrapper">
        <h1>Simple OLS Regression</h1>
        <div className="row">
          <div className="block-5">
            <div id="settings">
              <div className="row">
                <input
                  className="csv-input"
                  type="file"
                  ref={input => {
                    this.filesInput = input;
                  }}
                  name="file"
                  placeholder={null}
                  onChange={(e) => this.importCSV(e,this.updateData)}
                />
              </div>
            </div>
            <div id="variables" className={this.state.variables}>
              <button id="reg_btn" className="btn" name="regress" onClick={this.computeRegression}>Regress!</button>
            </div>
            <div id="reg_results" className={this.state.reg_results}>
<table id="reg_table">
  <thead>
      <tr>
         <th>
            Predictors
         </th>
         <th>
            Estimates
         </th>
         <th>
            Std Error
         </th>
      </tr>
   </thead>
   <tbody>
      {this.state.table_content}
   </tbody>
   <tfoot>
      <tr>
         <td>
            Observations
         </td>
         <td colSpan="2">
            {this.state.stats.n}
         </td>
      </tr>
      <tr>
         <td>
            R<sup>2</sup>
         </td>
         <td colSpan="2">
            {this.state.stats.Rsquare}
         </td>
      </tr>
    </tfoot>
</table>
            </div>
          </div>
          <div className="block-7">
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




const container = document.getElementById('root-ols-regression');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);

