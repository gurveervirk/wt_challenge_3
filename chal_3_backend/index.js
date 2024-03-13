require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Activity Schema
const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    default: "In Progress",
  },
});

const Activities = mongoose.model('Activities', activitySchema);

// CRUD Endpoints for Activities
app.get('/activities', async (req, res) => {
  try {
    const activities = await Activities.find();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/activities', async (req, res) => {
  try {
    const newActivity = new Activities(req.body);
    await newActivity.save();
    res.json(newActivity);
  } catch (error) {
    console.error('Error uploading activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/activities/:activityId', async (req, res) => {
  const { activityId } = req.params;
  const { status } = req.body;

  try {
    const updatedActivity = await Activities.findByIdAndUpdate(
      activityId,
      { $set: { status } },
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Calculate completion ratio and return badge based on ratio
app.get('/completionRatio', async (req, res) => {
  try {
    const completionRatio = await Activities.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: { if: { $eq: ['$status', 'Completed'] }, then: 1, else: 0 } } }
        }
      },
      {
        $project: {
          ratio: { $divide: ['$completed', '$total'] },
          badge: {
            $switch: {
              branches: [
                { case: { $gte: [{ $divide: ['$completed', '$total'] }, 0.8] }, then: 'gold' },
                { case: { $gte: [{ $divide: ['$completed', '$total'] }, 0.6] }, then: 'silver' },
                { case: { $gte: [{ $divide: ['$completed', '$total'] }, 0.5] }, then: 'bronze' },
              ],
              default: ''
            }
          }
        }
      }
    ]);

    if (completionRatio.length === 0) {
      return res.json({ ratio: 0, badge: '' }); // Return default values if no activities
    }

    res.json(completionRatio[0]);
  } catch (error) {
    console.error('Error calculating completion ratio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
