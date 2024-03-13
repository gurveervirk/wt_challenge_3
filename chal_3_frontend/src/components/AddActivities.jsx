import React, { useState, useEffect } from 'react';

const AddActivities = () => {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDeadline, setActivityDeadline] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddActivity = async () => {
    try {
      // If the activity title is unique, submit the new activity
      await fetch('http://localhost:3000/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: activityTitle,
          deadline: activityDeadline,
        }),
      });

      // Clear input fields after submission
      setActivityTitle('');
      setActivityDeadline('');

      // Show success message
      setShowErrorMessage(true);
      setErrorMessage('Activity added successfully.');
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Add Activity</h2>
      <div className="mb-3">
        <label htmlFor="activityTitle" className="form-label">Activity Title:</label>
        <input
          type="text"
          className="form-control"
          id="activityTitle"
          value={activityTitle}
          onChange={(e) => setActivityTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="activityDeadline" className="form-label">Deadline:</label>
        <input
          type="date"
          className="form-control"
          id="activityDeadline"
          value={activityDeadline}
          onChange={(e) => setActivityDeadline(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleAddActivity}>Submit</button>
      {showErrorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
    </div>
  );
};

export default AddActivities;
