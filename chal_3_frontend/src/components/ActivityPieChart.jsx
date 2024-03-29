import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js/auto';

function ActivityPieChart({activities}) {
  Chart.register(...registerables);
  const getActivityStatus = (deadline, status) => {
    const currentTimestamp = Date.now();
    const deadlineTimestamp = new Date(deadline).getTime();

    if (status === 'Completed' || status === 'Cancelled') {
      return status;
    } else if (deadlineTimestamp > currentTimestamp) {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  };

  // Count activities by status
  const countByStatus = activities.reduce((acc, activity) => {
    const status = getActivityStatus(activity.deadline, activity.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for pie chart
  const pieChartData = {
    labels: ['In Progress', 'Cancelled', 'Pending', 'Completed'],
    datasets: [{
      data: [countByStatus['In Progress'] || 0, countByStatus['Cancelled'] || 0, countByStatus['Pending'] || 0, countByStatus['Completed'] || 0],
      backgroundColor: ['#0D6EFD', '#DC3545', '#FFC107', '#28A745'],
      hoverBackgroundColor: ['#0D6EFD', '#DC3545', '#FFC107', '#28A745']
    }]
  };

  // Count activities by date
  const countByDateAndStatus = activities.reduce((acc, activity) => {
    const date = new Date(activity.deadline).toLocaleDateString();
    const status = getActivityStatus(activity.deadline, activity.status);
    acc[date] = acc[date] || {};
    acc[date][status] = (acc[date][status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for bar graph
  const barGraphData = {
    labels: Object.keys(countByDateAndStatus),
    datasets: Object.keys(countByStatus).map((status, index) => ({
      label: status,
      backgroundColor: status === 'In Progress' ? '#0D6EFD' : status === 'Cancelled' ? '#DC3545' : status === 'Pending' ? '#FFC107' : '#28A745',
      borderColor: status === 'In Progress' ? '#0D6EFD' : status === 'Cancelled' ? '#DC3545' : status === 'Pending' ? '#FFC107' : '#28A745',
      borderWidth: 1,
      data: Object.keys(countByDateAndStatus).map(date => countByDateAndStatus[date][status] || 0)
    }))
  };

  return (
    <div className="container">
    <div className="row">
      <div className="col d-flex justify-content-center">
        <div>
          <h2 className="text-center">Activity Pie Chart</h2>
          <div style={{ height: '200px', width: '200px' }}>
            <Pie data={pieChartData} />
          </div>
        </div>
      </div>
      <div className="col d-flex justify-content-center">
        <div>
          <h2 className="text-center">Activity Bar Graph</h2>
          <div style={{ height: '200px', width: '400px' }}>
            <Bar data={barGraphData} />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default ActivityPieChart;