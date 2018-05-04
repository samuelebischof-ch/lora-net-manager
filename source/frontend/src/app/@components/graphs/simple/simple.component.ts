import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '../../../@pipes/date.pipe';
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
    console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

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
        switch (label) {
          case '12AM': return '00:00';
          case '1AM': return '01:00';
          case '2AM': return '02:00';
          case '3AM': return '03:00';
          case '4AM': return '04:00';
          case '5AM': return '05:00';
          case '6AM': return '06:00';
          case '7AM': return '07:00';
          case '8AM': return '08:00';
          case '9AM': return '09:00';
          case '10AM': return '10:00';
          case '11AM': return '11:00';
          case '12PM': return '12:00';
          case '1PM': return '13:00';
          case '2PM': return '14:00';
          case '3PM': return '15:00';
          case '4PM': return '16:00';
          case '5PM': return '17:00';
          case '6PM': return '18:00';
          case '7PM': return '19:00';
          case '8PM': return '20:00';
          case '9PM': return '21:00';
          case '10PM': return '22:00';
          case '11PM': return '23:00';
          default: return label;
        }
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
    console.log(this.avg)
    this.setup();
  }

}
