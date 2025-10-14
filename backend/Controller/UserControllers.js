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
        console.log('Updating user:', req.params.id);
        console.log('Update data:', req.body);
        
        // Check if user exists
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Define allowed fields for profile updates
        const allowedFields = ['name', 'email', 'mobileNumber', 'dob', 'gender', 'address'];
        const updateData = {};
        
        // Only include allowed fields in update
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        console.log('Sanitized update data:', updateData);

        // Update user with sanitized data
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password'); // Don't return password

        console.log('Updated user:', user);
        return res.status(200).json(user);
    } catch (err) {
        console.error('Error updating user:', err);
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

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password for security
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        return res.status(500).json({ 
            message: "Error fetching user",
            error: err.message 
        });
    }
};

exports.getAllUsers = getAllUsers; //export the function
exports.addAllUsers = addAllUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUserById = getUserById;