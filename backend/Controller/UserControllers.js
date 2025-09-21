const User = require('../Model/UserModel');

const getAllUsers = async (req, res) => {   
    try {
        const { role } = req.query;
        let query = {};
        
        // If role is specified, filter by role
        if (role) {
            query.role = role;
        }

        const Users = await User.find(query);
        
        if(!Users || Users.length === 0) {
            return res.status(200).json({ Users: [] });
        }

        return res.status(200).json({ Users });
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ 
            message: "Error fetching users",
            error: err.message 
        });
    }
};

// Add getUserById function to fetch a single user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Remove sensitive information
        const userResponse = {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            gender: user.gender,
            address: user.address,
            role: user.role
        };
        
        return res.status(200).json(userResponse);
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        return res.status(500).json({ 
            message: "Error fetching user details",
            error: err.message 
        });
    }
};

//data Insert
const addAllUsers = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        return res.status(201).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = getAllUsers; //export the function
exports.getUserById = getUserById; // export the new function
exports.addAllUsers = addAllUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;