const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Middleware to authenticate JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/drivers
// @desc    Get all drivers
// @access  Public
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json(drivers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/guides
// @desc    Get all guides
// @access  Public
router.get('/guides', async (req, res) => {
  try {
    const guides = await User.find({ role: 'guide' }).select('-password');
    res.json(guides);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Configure Multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// @route   PUT /api/users/driver/update
// @desc    Update driver details and images
// @access  Private
router.put('/driver/update', auth, upload.array('images', 5), async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update these details' });
    }

    const { vehicleType, vehicleNumber, availability, pricePerDay } = req.body;
    if (vehicleType) user.vehicleType = vehicleType;
    if (vehicleNumber) user.vehicleNumber = vehicleNumber;
    if (availability) user.availability = availability;
    if (pricePerDay !== undefined && pricePerDay !== '') user.pricePerDay = Number(pricePerDay);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      user.vehicleImages = [...(user.vehicleImages || []), ...newImages];
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/driver/image
// @desc    Delete driver vehicle image
// @access  Private
router.delete('/driver/image', auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    let user = await User.findById(req.user.id);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (user.vehicleImages && user.vehicleImages.includes(imageUrl)) {
      user.vehicleImages = user.vehicleImages.filter(img => img !== imageUrl);
      await user.save();
      
      const filepath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
