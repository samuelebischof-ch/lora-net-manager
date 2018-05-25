import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '../../../@pipes/date/date.pipe';
import { HourPipe } from '../../../@pipes/hour/hour.pipe';
import { Options, Colors } from './grapjs.options';

@Component({
  selector: 'app-graph-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss'],
})
export class SimpleComponent implements OnChanges  {

  constructor() { }

  @Input() unit = '';
  @Input() label = '';
  @Input() min: number;
  @Input() max: number;
  @Input() avg: Array<number>;
  private average: number;

  // lineChart
  @Input() lineChartData: Array<any> = [];
  @Input() lineChartLabels: Array<any> = [];
  @Input() specialColor: boolean;

  public lineChartOptions: any = Options;
  public lineChartColors: Array<any> = Colors;
  public lineChartLegend = true;
  public lineChartType = 'line';

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  /**
   * @name setup
   * @description runs the setup fro the graph
   */
  setup() {
    const self = this;

    if (!this.specialColor) {
      let average = 0;
      // calculate average
      let count = 0;
      this.avg.forEach(av => {
        if (av !== null) {
          average += av;
          count++;
        }
      });
      this.average = Math.round((average / count) * 10) / 10;
    }

    // active on live visualisation modus
    if (this.specialColor) {
      this.lineChartColors = [
        {
          backgroundColor: 'rgba(239,19,64,0.2)',
          borderColor: 'rgba(239,19,64,1)',
          pointBackgroundColor: 'rgba(239,19,64,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(239,19,64,0.8)'
        },
      ];
    }

    /**
    * adds options for xScale
    */
    this.lineChartOptions.scales.xAxes[0].ticks = {
      callback: function(label, index, labels) {
        return new HourPipe().transform(label);
      },
    };

    /**
    * adds options for yScale
    */
    this.lineChartOptions.scales.yAxes = [{
      ticks: {
        callback: function(label, index, labels) {
          return label + ' ' + self.unit;
        },
      },
      scaleLabel: {
        display: true,
        labelString: self.label
      }
    }];

    /**
    * adds options for tooltip visualisation
    */
    this.lineChartOptions.tooltips = {
      callbacks: {
        label: function(tooltipItem, data) {
          return ' Value: ' + Math.round(tooltipItem.yLabel * 10) / 10  + ' ' + self.unit;
        },
        title: function(data) {
          return 'Date: ' + new DatePipe().transform(data[0].xLabel);
        },
      },
    };

  }

  ngOnChanges(changes: SimpleChanges) {
    this.setup();
  }

}
