const EditGroupsPermissions = {
    user: {
        user: false,
        staff: false,
        admin: false,
        superAdmin: false
    },
    staff: {
        user: true,
        staff: false, 
        admin: false,
        superAdmin: false
    },
    admin: {
        user: true,
        staff: true, 
        admin: false,
        superAdmin: false
    },
    superAdmin: {
        user: true,
        staff: true, 
        admin: true,
        superAdmin: true
    }
}

module.exports = {
    EditGroupsPermissions
}