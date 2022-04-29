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
// import {InlineMath} from 'react-katex';
// import * as ss from 'simple-statistics'
import {inv,sqrt,reshape,mean,diag,round,subset,index,range,multiply,transpose} from 'mathjs';

const Papa = require("papaparse/papaparse.min.js");

const Plot = createPlotlyComponent(Plotly);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.filesInput = React.createRef();
    this.state = {
        params: {
          ind_var: "",
          plot_var: ""
        },
        stats: {
          n: 0,
          Rsquare: 0
        },
        variables: "collapse",
        reg_results: "collapse",
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
              'x: %{x:.0f}' +
              '<br>y: %{y:.2f}' +
              '<extra></extra>'
          },
          {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: '',
            marker: { 
              size: 12
            },
            hovertemplate: 
              'x: %{x:.0f}' +
              '<br>y: %{y:.2f}' +
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
    partialState.params[event.target.name] = event.target.value;
    this.setState(partialState, function() {
      this.chooseVars()
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

    // Loop through the keys to add to the dropdown menu
    var ind_var_choices = keys.map((k,i) => {
      return (
        <option key={i} value={k}>{k}</option>
      )
    })

    var plot_var_choices = keys.map((k,i) => {
      return (
        <option key={i} value={k}>{k}</option>
      )
    })

    // Assign the ind. var. and the plotted dep. var.
    let params = Object.assign({}, this.state.params);
    params["ind_var"] = keys[0];
    params["plot_var"] = keys[1];

    this.setState({
      keys: keys,
      params: params,
      database: data,
      ind_var_choices: ind_var_choices,
      plot_var_choices: plot_var_choices,
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

    var n = this.state.database.length

    // Find the column index from the user's selection
    let col_ind = this.state.keys.indexOf(this.state.params.ind_var)
    var Y = subset(this.state.database, index(range(0,n),col_ind)).flat()
    
    let col_plot = this.state.keys.indexOf(this.state.params.plot_var)
    var cof = subset(this.state.database, index(range(0,n),col_plot)).flat()

    let partialState = Object.assign({}, this.state);
    partialState.data[1].x = cof;
    partialState.data[1].y = Y;
    partialState.data[1].name = this.state.params.ind_var + "~" + this.state.params.plot_var

    const newLayout = Object.assign({}, this.state.layout);
    newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;
    newLayout.yaxis.title = this.state.params.ind_var
    newLayout.xaxis.title = this.state.params.plot_var

    this.setState({
      data: partialState.data,
      layout: newLayout
    })
  }

  computeRegression() {
    var n = this.state.database.length
    // Find away to avoid redundacy with chooseVars function
    let col_ind = this.state.keys.indexOf(this.state.params.ind_var)
    var Y = subset(this.state.database, index([...Array(n).keys()],col_ind)).flat()
    console.log(Y)
    var p = this.state.keys.length
    var ind = [...Array(p).keys()]
    ind.splice(col_ind,1)

    var cof = subset(this.state.database, index([...Array(n).keys()],ind))
    console.log(reshape(transpose(cof).flat(),[n,p-1]))
    var tX = [Array(n).fill(1),reshape(transpose(cof).flat(),[n,p-1])]

    var X = transpose(tX)

    var Sxx = inv(multiply(tX,X))
    var beta = multiply(multiply(Sxx,tX),Y)

    var Yhat = multiply(X,beta)
    var Ybar = mean(Y)

    var ssr = Y.reduce((pV,cV,cI) => pV + (cV - Yhat[cI])**2,0)
    var sst = Y.reduce((pV,cV) => pV + (cV - Ybar)**2,0)
    var Rsquare = 1 - ssr/sst

    var Vbeta_hat = multiply(ssr/(n-p), diag(Sxx))
    var std_err = sqrt(Vbeta_hat)
    // console.log(std_err)

    let partialState = Object.assign({}, this.state);
    let col_plot = this.state.keys.indexOf(this.state.params.plot_var)
    partialState.data[0].x = subset(this.state.database, index(range(0,n),col_plot)).flat()
    partialState.data[0].y = Yhat;

    var x_var = JSON.parse(JSON.stringify(this.state.keys))
    x_var.splice(col_ind,1)
    x_var.unshift("(Intercept)")

    var table_content = x_var.map((k,i) => {
      return (
        <tr key={i}>
          <td>
            {k}
          </td>
          <td>
            {round(beta[i],4)}
          </td>
          <td>
            {round(std_err[i],4)}
          </td>
        </tr>
      );
    })

    var stats = {
      Rsquare: round(Rsquare,4),
      n: n
    }

    // See https://github.com/plotly/react-plotly.js#refreshing-the-plot and the discussion here https://github.com/plotly/react-plotly.js/issues/59
    const newLayout = Object.assign({}, this.state.layout);
    newLayout.datarevision = (partialState.layout.datarevision + 1) % 10;

    this.setState({
      reg_results: "",
      table_content: table_content,
      stats: stats,
      data: partialState.data,
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
              <div className="row">
                <div className="entry">
                  <label>
                    Independent Variable:  
                    <select name="ind_var" onChange={this.handleChange}>
                      {this.state.ind_var_choices}
                    </select>
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="entry">
                  <label>
                    Var. to plot against ind. var.:  
                    <select name="plot_var" value={this.state.params.plot_var} onChange={this.handleChange}>
                      {this.state.plot_var_choices}
                    </select>
                  </label>
                </div>
              </div>
              <div className="row">
                <button id="reg_btn" className="btn" name="regress" onClick={this.computeRegression}>Regress!</button>
              </div>
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

