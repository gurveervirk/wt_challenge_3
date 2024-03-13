import React, { useState, useEffect } from 'react';
import ActivityPieChart from './ActivityPieChart';

const ListActivities = () => {
  const [activities, setActivities] = useState([]);
  const [completionRatioBadge, setCompletionRatioBadge] = useState('');
  useEffect(() => {
    fetchActivities();
    fetchCompletionRatioBadge();
  }, []);

  // useEffect(() => {
  //   generateDayWiseActivitiesData();
  //   generateOverallActivitiesData();
  // }, [activities]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:3000/activities');
      const data = await response.json();

      const currentDate = new Date();
      const updatedActivities = data.map(activity => {
        if (new Date(activity.deadline) > currentDate) {
          if (activity.status !== "Completed" && activity.status !== "Cancelled") {
            updateActivityStatus(activity._id, "In Progress");
            activity.status = "In Progress";
          }
        } else if (activity.status !== "Completed" && activity.status !== "Cancelled") {
          updateActivityStatus(activity._id, "Pending");
          activity.status = "Pending";
        }
        // Extract only date part from the deadline
        activity.deadline = new Date(activity.deadline).toLocaleDateString();
        return activity;
      });

      // Sort activities by deadline
      updatedActivities.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const updateActivityStatus = async (activityId, status) => {
    try {
      await fetch(`http://localhost:3000/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      fetchCompletionRatioBadge();
    } catch (error) {
      console.error('Error updating activity status:', error);
    }
  };

  const fetchCompletionRatioBadge = async () => {
    try {
      const response = await fetch('http://localhost:3000/completionRatio');
      const data = await response.json();
      setCompletionRatioBadge(data.badge);
    } catch (error) {
      console.error('Error fetching completion ratio:', error);
    }
  };

  const handleAction = async (activityId, status) => {
    const newStatus = status === "Completed" ? "Completed" : "Cancelled";
    await updateActivityStatus(activityId, newStatus);
    setActivities(prevActivities =>
      prevActivities.map(activity =>
        activity._id === activityId ? { ...activity, status: newStatus } : activity
      )
    );
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        {completionRatioBadge === 'gold' && (
          <span className="badge bg-warning text-dark me-3">Gold Badge</span>
        )}
        {completionRatioBadge === 'silver' && (
          <span className="badge bg-secondary me-3">Silver Badge</span>
        )}
        {completionRatioBadge === 'bronze' && (
          <span className="badge bg-dark me-3">Bronze Badge</span>
        )}
      </div>
      <h2>Activities Charts</h2>
      <ActivityPieChart/>
      <h2>Activities</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(activity => (
            <tr key={activity._id}>
              <td>{activity.title}</td>
              <td>{activity.deadline}</td>
              <td>
                <span className={`badge bg-${getStatusColor(activity.status)}`}>{activity.status}</span>
              </td>
              <td>
                {(activity.status === "In Progress" || activity.status === "Pending") && (
                  <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id={`dropdownMenuButton${activity._id}`} data-bs-toggle="dropdown" aria-expanded="false">
                      Action
                    </button>
                    <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${activity._id}`}>
                      <li><button className="dropdown-item" onClick={() => handleAction(activity._id, "Completed")}>Complete</button></li>
                      <li><button className="dropdown-item" onClick={() => handleAction(activity._id, "Cancelled")}>Cancel</button></li>
                    </ul>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "In Progress":
      return "primary";
    case "Pending":
      return "warning";
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

export default ListActivities;
