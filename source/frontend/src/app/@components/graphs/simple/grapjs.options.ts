export const Options = {
  animation: {
    duration: 0,
  },
  responsive: true,
  scales:
  {
    xAxes: [{
      display: true,
      type: 'time',
      id: 'x-axis-1',
    },
  ],
  yAxes: [{
    display: true,
    type: 'linear',
    position: 'left',
    id: 'y-axis-1',
  },
]
},
tooltips: {
  callbacks: {
    label: function(tooltipItem, data) {
      return 'Value: ' + Math.round(tooltipItem.yLabel * 10) / 10;
    },
    title: function(date) {
      return date;
    }
  }
}
};


export const Colors = [
  {
    backgroundColor: 'rgba(255,132,21,0.2)',
    borderColor: 'rgba(255,132,21,1)',
    pointBackgroundColor: 'rgba(255,132,21,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(255,132,21,0.8)'
  },
  {
    backgroundColor: 'rgba(239,19,64,0.2)',
    borderColor: 'rgba(239,19,64,1)',
    pointBackgroundColor: 'rgba(239,19,64,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(239,19,64,0.8)'
  },
  {
    backgroundColor: 'rgba(130,34,255,0.2)',
    borderColor: 'rgba(130,34,255,1)',
    pointBackgroundColor: 'rgba(130,34,255,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(130,34,255,0.8)'
  },
  {
    backgroundColor: 'rgba(23,137,232,0.2)',
    borderColor: 'rgba(23,137,232,1)',
    pointBackgroundColor: 'rgba(23,137,232,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(23,137,232,0.8)'
  },
  {
    backgroundColor: 'rgba(42,255,138,0.2)',
    borderColor: 'rgba(42,255,138,1)',
    pointBackgroundColor: 'rgba(42,255,138,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(42,255,138,0.8)'
  },
];
