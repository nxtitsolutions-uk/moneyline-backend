const NotificationSettings = require('../models/notificationSettingsModel');

// Controller to update user notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    
    // Extract the userId from the request (assuming userId is stored in req.user)
    const userId = req.user._id;
    const { game_reminders, voting_updates } = req.body.preferences;
        console.log("======================updating notification settings==========================", req.user);

    console.log("Updating notification settings for user:", userId, req.body);
    
    // Validate preferences
    if (game_reminders === undefined || voting_updates === undefined) {
      return res.status(400).json({ message: "Notification preferences must be provided." });
    }

    // Find and update notification settings by userId
    const updatedSettings = await NotificationSettings.findOneAndUpdate(
      { userId },  // Find the settings for the specific user
      { 
        $set: {
          'preferences.game_reminders': game_reminders,
          'preferences.voting_updates': voting_updates,
        },
      },
      { new: true, upsert: true } // `upsert: true` will create the document if it doesn't exist
    );

    // Return the updated notification settings
    return res.status(200).json({
      message: "Notification settings updated successfully.",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return res.status(500).json({ message: "Server error while updating notification settings." });
  }
};
