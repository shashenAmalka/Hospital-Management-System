/**
 * Socket.io server for real-time notifications
 */
const socketIO = require('socket.io');

let io;

// Connected users map: userId -> socketId
const connectedUsers = new Map();

// Initialize socket.io server
const initSocketServer = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // In production, restrict this to your frontend domain
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Add user to connected users map
    const userId = socket.handshake.query.userId;
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Remove user from connected users map
      if (userId) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  });
  
  return io;
};

// Send notification to a specific user
const sendNotificationToUser = (userId, notification) => {
  if (!io) {
    console.error('Socket server not initialized');
    return;
  }
  
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    // Send notification to the specific user
    io.to(socketId).emit('notification', notification);
    console.log(`Notification sent to user ${userId} (socket ${socketId})`);
  } else {
    console.log(`User ${userId} is not connected, notification not sent`);
  }
};

// Send lab request notification to lab technicians
const sendLabRequestNotification = (notification) => {
  if (!io) {
    console.error('Socket server not initialized');
    return;
  }
  
  // Send to all connected users with lab_technician role
  // In a real scenario, you'd check user roles in the connectedUsers map
  io.emit('new_lab_request', notification);
  console.log('Lab request notification broadcasted');
};

module.exports = {
  initSocketServer,
  sendNotificationToUser,
  sendLabRequestNotification
};